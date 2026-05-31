const fs = await import('node:fs');
const {fileURLToPath} = await import('node:url');

import {
  dependencyIsClosed,
  DEPENDENCY_KINDS,
  DEPENDENCY_STATES,
} from './goal-ledger.mjs';
import {buildExecutionPlan} from '../../subagent-coordinator/scripts/build-execution-plan.mjs';

export const GOAL_PIVOT_POLICY_MODES = Object.freeze([
  'permissive',
  'strict',
]);

const GOAL_PIVOT_DECISIONS = Object.freeze([
  'allow',
  'block',
  'defer',
  'reroute',
]);

const HARD_DEPENDENCY_KINDS = new Set([
  'prerequisite',
  'contract',
  'blocker',
  'validated_artifact',
  'invariant',
  'resume_anchor',
]);

const ACTIVE_BRANCH_SHAPES = new Set([
  'bounded_write',
  'independent_parallel',
  'dependency_ordered',
  'resume_or_revisit',
  'exploratory',
]);

function normalizeStringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];
}

function normalizeDependency(raw) {
  return {
    kind: DEPENDENCY_KINDS.includes(raw?.kind) ? raw.kind : 'prerequisite',
    target: typeof raw?.target === 'string' ? raw.target : '',
    state: DEPENDENCY_STATES.includes(raw?.state) ? raw.state : 'unknown',
    hard: Boolean(raw?.hard),
  };
}

function normalizeActiveBranch(raw, index) {
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : `active-${index + 1}`,
    shape: ACTIVE_BRANCH_SHAPES.has(raw?.shape) ? raw.shape : 'bounded_write',
    ownerRole: typeof raw?.ownerRole === 'string' ? raw.ownerRole : '',
    scope: normalizeStringList(raw?.scope),
    validation: typeof raw?.validation === 'string' ? raw.validation : '',
    blockedBy: normalizeStringList(raw?.blockedBy),
    prerequisiteOf: normalizeStringList(raw?.prerequisiteOf),
  };
}

function normalizeRequestedExecution(raw, requestedGoal, surfaceClear) {
  return {
    taskAnchor: typeof raw?.taskAnchor === 'string' && raw.taskAnchor ? raw.taskAnchor : requestedGoal,
    delegationAllowed: raw?.delegationAllowed !== false,
    surfaceClear: raw?.surfaceClear !== undefined ? Boolean(raw.surfaceClear) : surfaceClear,
    branches: Array.isArray(raw?.branches) ? raw.branches : [],
  };
}

function normalizeInput(raw) {
  return {
    taskAnchor: typeof raw?.taskAnchor === 'string' ? raw.taskAnchor : '',
    activeGoal: typeof raw?.activeGoal === 'string' ? raw.activeGoal : '',
    requestedGoal: typeof raw?.requestedGoal === 'string' ? raw.requestedGoal : '',
    pivotReason: typeof raw?.pivotReason === 'string' ? raw.pivotReason : '',
    policyMode: GOAL_PIVOT_POLICY_MODES.includes(raw?.policyMode) ? raw.policyMode : 'permissive',
    forceOverride: Boolean(raw?.forceOverride),
    surfaceClear: Boolean(raw?.surfaceClear),
    dependsOn: Array.isArray(raw?.dependsOn) ? raw.dependsOn.map(normalizeDependency) : [],
    hardConstraints: normalizeStringList(raw?.hardConstraints),
    blockedBy: normalizeStringList(raw?.blockedBy),
    resumeAnchor: typeof raw?.resumeAnchor === 'string' ? raw.resumeAnchor : '',
    activeBranches: Array.isArray(raw?.activeBranches) ? raw.activeBranches.map(normalizeActiveBranch) : [],
    requestedExecution: normalizeRequestedExecution(raw?.requestedExecution, raw?.requestedGoal, Boolean(raw?.surfaceClear)),
  };
}

function unresolvedHardDependencies(dependsOn) {
  return dependsOn.filter((dependency) =>
    (dependency.hard || HARD_DEPENDENCY_KINDS.has(dependency.kind))
    && !dependencyIsClosed(dependency));
}

function findScopeOverlaps(activeBranches, requestedBranches) {
  const overlaps = [];
  for (const activeBranch of activeBranches) {
    const activeScope = new Set(activeBranch.scope);
    if (activeScope.size === 0) {
      continue;
    }

    for (const requestedBranch of requestedBranches) {
      const shared = normalizeStringList(requestedBranch?.scope).filter((item) => activeScope.has(item));
      if (shared.length > 0) {
        overlaps.push({
          activeBranchId: activeBranch.id,
          requestedBranchId: typeof requestedBranch?.id === 'string' ? requestedBranch.id : '',
          sharedScope: shared,
        });
      }
    }
  }
  return overlaps;
}

function decisionFor(input) {
  const hardDependencies = unresolvedHardDependencies(input.dependsOn);
  const reasons = [];

  if (!input.requestedGoal) {
    return {
      decision: 'defer',
      reasons: ['missing requested goal'],
      hardDependencies,
      scopeOverlaps: [],
    };
  }

  if (!input.forceOverride && (input.blockedBy.length > 0 || hardDependencies.length > 0)) {
    if (input.blockedBy.length > 0) {
      reasons.push(`blocked by: ${input.blockedBy.join(', ')}`);
    }
    reasons.push(...hardDependencies.map((dependency) =>
      `open hard dependency: ${dependency.kind}:${dependency.target || '(unspecified)'}`));
    return {
      decision: 'block',
      reasons,
      hardDependencies,
      scopeOverlaps: [],
    };
  }

  if (!input.surfaceClear) {
    return {
      decision: 'defer',
      reasons: ['surface is not clear enough to launch'],
      hardDependencies,
      scopeOverlaps: [],
    };
  }

  if (!Array.isArray(input.requestedExecution.branches) || input.requestedExecution.branches.length === 0) {
    return {
      decision: 'defer',
      reasons: ['requested execution has no branches'],
      hardDependencies,
      scopeOverlaps: [],
    };
  }

  const scopeOverlaps = findScopeOverlaps(input.activeBranches, input.requestedExecution.branches);
  const hasDownstreamActiveWork = input.activeBranches.some((branch) =>
    branch.prerequisiteOf.length > 0 || branch.shape === 'dependency_ordered');

  if (scopeOverlaps.length > 0 || hasDownstreamActiveWork) {
    reasons.push(
      scopeOverlaps.length > 0
        ? 'accepted pivot overlaps active branch scope and must reroute ownership'
        : 'accepted pivot invalidates dependency-ordered downstream work');
    return {
      decision: 'reroute',
      reasons,
      hardDependencies,
      scopeOverlaps,
    };
  }

  return {
    decision: 'allow',
    reasons: ['pivot is clear and no open prerequisite forces the old path'],
    hardDependencies,
    scopeOverlaps,
  };
}

export function buildGoalPivotPlan(rawInput) {
  const input = normalizeInput(rawInput);
  const gate = decisionFor(input);
  const coordinatorInput = gate.decision === 'allow' || gate.decision === 'reroute'
    ? {
      ...input.requestedExecution,
      taskAnchor: input.requestedExecution.taskAnchor || input.requestedGoal,
      surfaceClear: input.requestedExecution.surfaceClear,
      delegationAllowed: input.requestedExecution.delegationAllowed,
    }
    : null;

  return {
    taskAnchor: input.taskAnchor,
    activeGoal: input.activeGoal || input.taskAnchor,
    requestedGoal: input.requestedGoal,
    pivotReason: input.pivotReason,
    policyMode: input.policyMode,
    forceOverride: input.forceOverride,
    surfaceClear: input.surfaceClear,
    dependsOn: input.dependsOn,
    hardConstraints: input.hardConstraints,
    blockedBy: input.blockedBy,
    resumeAnchor: input.resumeAnchor,
    activeBranches: input.activeBranches,
    decision: GOAL_PIVOT_DECISIONS.includes(gate.decision) ? gate.decision : 'defer',
    reasons: gate.reasons,
    blockingPrerequisites: gate.hardDependencies,
    reroutedBranches: gate.scopeOverlaps,
    coordinatorInput,
    coordinatorPreview: coordinatorInput ? buildExecutionPlan(coordinatorInput) : null,
  };
}

function readInput(pathArg) {
  if (pathArg) {
    return JSON.parse(fs.readFileSync(pathArg, 'utf8').replace(/^\uFEFF/, ''));
  }

  const stdin = fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(stdin);
}

if (typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = readInput(process.argv[2]);
  const plan = buildGoalPivotPlan(input);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}
