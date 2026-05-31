const fs = await import('node:fs');
const {fileURLToPath} = await import('node:url');

import {
  appendGoalEntry,
  createGoalEntry,
  createGoalId,
  defaultLedgerPath,
  normalizeGoalEntry,
} from './goal-ledger.mjs';
import {buildGoalPivotPlan} from './build-goal-pivot-plan.mjs';
import {
  buildLaunchBundle,
  launchExecutionPlan,
} from '../../subagent-coordinator/scripts/launch-execution-plan.mjs';

function statusForDecision(decision) {
  switch (decision) {
  case 'block':
    return 'blocked';
  case 'defer':
    return 'deferred';
  case 'reroute':
    return 'rerouted';
  default:
    return 'active';
  }
}

export function buildGoalPivotBundle(rawInput, options = {}) {
  const plan = buildGoalPivotPlan(rawInput);
  const launchPolicy = options.launchPolicy || plan.policyMode;
  const coordinatorBundle = plan.coordinatorInput
    ? buildLaunchBundle(plan.coordinatorInput, {launchPolicy})
    : null;

  return {
    plan,
    launchPolicy,
    coordinatorBundle,
  };
}

export async function launchGoalPivot(rawInput, options = {}) {
  const bundle = buildGoalPivotBundle(rawInput, options);
  let launchResult = null;
  const acceptedPivot = bundle.plan.decision === 'allow' || bundle.plan.decision === 'reroute';

  if (bundle.plan.coordinatorInput && options.execute !== false) {
    launchResult = await launchExecutionPlan(bundle.plan.coordinatorInput, {
      launchPolicy: bundle.launchPolicy,
      spawnAgent: options.spawnAgent,
    });
  }

  const entry = normalizeGoalEntry(createGoalEntry({
    goalId: typeof rawInput?.goalId === 'string' && rawInput.goalId
      ? rawInput.goalId
      : createGoalId(bundle.plan.requestedGoal || bundle.plan.taskAnchor || 'pivot'),
    parentGoalId: typeof rawInput?.parentGoalId === 'string' ? rawInput.parentGoalId : '',
    taskAnchor: bundle.plan.taskAnchor,
    requestedGoal: bundle.plan.requestedGoal,
    activeGoal: acceptedPivot
      ? (bundle.plan.requestedGoal || bundle.plan.activeGoal)
      : bundle.plan.activeGoal,
    priorGoal: bundle.plan.activeGoal,
    status: statusForDecision(bundle.plan.decision),
    pivotReason: bundle.plan.pivotReason,
    dependsOn: bundle.plan.dependsOn,
    hardConstraints: bundle.plan.hardConstraints,
    blockedBy: bundle.plan.blockedBy,
    resumeAnchor: bundle.plan.resumeAnchor,
    decision: bundle.plan.decision,
    decisionReasons: bundle.plan.reasons,
    policyMode: bundle.launchPolicy,
    coordinatorTaskSet: bundle.plan.coordinatorInput,
    launchResults: Array.isArray(launchResult?.launchResults) ? launchResult.launchResults : [],
  }));

  const ledger = appendGoalEntry(entry, options.ledgerPath || rawInput?.ledgerPath || defaultLedgerPath());

  return {
    ...bundle,
    launchResult,
    ledgerPath: ledger.ledgerPath,
    ledgerEntry: ledger.entry,
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
  const bundle = await launchGoalPivot(input, {
    launchPolicy: process.argv[3],
    execute: false,
  });
  process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
}
