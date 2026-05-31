const fs = await import('node:fs');
const {fileURLToPath} = await import('node:url');

import {buildExecutionPlan} from './build-execution-plan.mjs';
import {
  createTelemetryRecord,
  normalizeTelemetryRecord,
} from '../../skill-router/scripts/telemetry-foundation.mjs';

export const BRANCH_LAUNCH_DECISIONS = Object.freeze([
  'launch',
  'defer',
  'deny',
]);

export const LAUNCH_POLICY_MODES = Object.freeze([
  'permissive',
  'strict',
]);

function normalizePolicy(value) {
  return LAUNCH_POLICY_MODES.includes(value) ? value : 'permissive';
}

function readInput(pathArg) {
  if (pathArg) {
    return JSON.parse(fs.readFileSync(pathArg, 'utf8').replace(/^\uFEFF/, ''));
  }

  const stdin = fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(stdin);
}

function buildTopLevelPermission(plan, launchPolicy) {
  if (!plan.delegationAllowed) {
    return {
      decision: 'deny',
      reasons: ['delegationAllowed=false'],
    };
  }

  return {
    decision: 'launch',
    reasons: [`launch policy=${launchPolicy}`],
  };
}

function branchDecision(branch, launchPolicy, topLevelDecision) {
  if (topLevelDecision.decision !== 'launch') {
    return {
      decision: 'deny',
      reasons: ['top-level delegation denied'],
    };
  }

  if (!branch.task) {
    return {
      decision: 'deny',
      reasons: ['missing branch task'],
    };
  }

  if (launchPolicy === 'strict' && branch.ownerRole === 'worker' && !branch.validation) {
    return {
      decision: 'defer',
      reasons: ['strict mode requires validation for worker branches'],
    };
  }

  if (branch.shape !== 'exploratory' && branch.ownerRole === 'worker' && branch.contextPacket.writeScope.length === 0) {
    return {
      decision: launchPolicy === 'strict' ? 'defer' : 'launch',
      reasons: launchPolicy === 'strict'
        ? ['missing write scope for non-exploratory worker branch']
        : ['permissive launch without explicit write scope'],
    };
  }

  if (
    branch.shape === 'exploratory' &&
    !branch.permittedRoutedSkills.includes('expand-skill') &&
    !branch.permittedRoutedSkills.includes('exp')
  ) {
    return {
      decision: 'defer',
      reasons: ['exploratory branch should widen through exp or expand-skill first'],
    };
  }

  return {
    decision: 'launch',
    reasons: [`branch ready under ${launchPolicy} policy`],
  };
}

function buildSpawnRequest(branch) {
  return {
    agent_type: branch.ownerRole,
    model: branch.model,
    reasoning_effort: branch.reasoningEffort,
    message: branch.spawnPrompt,
  };
}

function buildTelemetry(plan, permissionLayer) {
  return normalizeTelemetryRecord(createTelemetryRecord({
    taskAnchor: plan.taskAnchor,
    firstApprovedSkill: plan.routedSkills.first[0] || '',
    approvedFollowOnSkills: permissionLayer.topLevel.decision === 'launch'
      ? plan.routedSkills.permitted.slice(1)
      : [],
    deferredSkills: permissionLayer.branches
      .filter((branch) => branch.permission.decision !== 'launch')
      .map((branch) => branch.id),
    trafficReasons: permissionLayer.branches.flatMap((branch) =>
      branch.permission.reasons.map((detail) => ({
        reason: 'coordination_or_handoff_cost',
        detail: `${branch.id}: ${detail}`,
      }))),
    permissionDecision: permissionLayer.topLevel.decision === 'launch'
      ? 'approve_minimum_set'
      : 'deny_widening',
    immediateSurfaceChosen: {
      kind: 'artifact',
      value: 'subagent execution plan',
    },
  }));
}

export function buildLaunchBundle(rawInput, options = {}) {
  const launchPolicy = normalizePolicy(options.launchPolicy);
  const plan = buildExecutionPlan(rawInput);
  const topLevel = buildTopLevelPermission(plan, launchPolicy);
  const branches = plan.branches.map((branch) => {
    const permission = branchDecision(branch, launchPolicy, topLevel);
    return {
      id: branch.id,
      permission,
      spawnRequest: permission.decision === 'launch' ? buildSpawnRequest(branch) : null,
      branch,
    };
  });

  return {
    launchPolicy,
    permissionLayer: {
      topLevel,
      branches,
    },
    plan,
    telemetry: buildTelemetry(plan, {topLevel, branches}),
  };
}

function defaultSpawnAdapter() {
  const runtime = globalThis.codex;
  if (!runtime || typeof runtime.tool !== 'function') {
    return null;
  }

  return async function spawnWithCodex(request) {
    return runtime.tool('spawn_agent', request);
  };
}

export async function launchExecutionPlan(rawInput, options = {}) {
  const bundle = buildLaunchBundle(rawInput, options);
  const spawnAgent = options.spawnAgent || defaultSpawnAdapter();

  if (!spawnAgent) {
    return {
      ...bundle,
      launched: false,
      launchResults: [],
      runtime: 'dry-run',
    };
  }

  const launchResults = [];
  for (const branch of bundle.permissionLayer.branches) {
    if (branch.permission.decision !== 'launch' || !branch.spawnRequest) {
      launchResults.push({
        id: branch.id,
        launched: false,
        decision: branch.permission.decision,
        reasons: branch.permission.reasons,
      });
      continue;
    }

    const result = await spawnAgent(branch.spawnRequest);
    launchResults.push({
      id: branch.id,
      launched: true,
      decision: branch.permission.decision,
      reasons: branch.permission.reasons,
      result,
    });
  }

  return {
    ...bundle,
    launched: true,
    launchResults,
    runtime: 'codex',
  };
}

if (typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = readInput(process.argv[2]);
  const bundle = buildLaunchBundle(input, {
    launchPolicy: process.argv[3],
  });
  process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
}
