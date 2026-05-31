const fs = await import('node:fs');
const {fileURLToPath} = await import('node:url');

export const BRANCH_SHAPES = Object.freeze([
  'exploratory',
  'bounded_write',
  'independent_parallel',
  'dependency_ordered',
  'resume_or_revisit',
]);

export const TASK_KINDS = Object.freeze([
  'analysis',
  'implementation',
  'tests',
  'debugging',
  'refactor',
]);

const RISK_LEVELS = new Set(['low', 'medium', 'high']);
const PERMITTED_ROUTED_SKILLS = Object.freeze([
  'skill-router',
  'goal-pivot-ledger',
  'exp',
  'expand-skill',
  'balanced-subagents',
  'topological-subagents',
  'thread-memory-bridge',
  'session-reload',
  'branch-artifacts',
]);

function normalizeStringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];
}

function normalizeBoolean(value) {
  return Boolean(value);
}

function normalizeRisk(value, fallback = 'medium') {
  return typeof value === 'string' && RISK_LEVELS.has(value) ? value : fallback;
}

function normalizeShape(value) {
  return BRANCH_SHAPES.includes(value) ? value : 'bounded_write';
}

function normalizeTaskKind(value) {
  return TASK_KINDS.includes(value) ? value : 'implementation';
}

function normalizeBranch(raw, index) {
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : `branch-${index + 1}`,
    task: typeof raw?.task === 'string' ? raw.task : '',
    shape: normalizeShape(raw?.shape),
    taskKind: normalizeTaskKind(raw?.taskKind),
    scope: normalizeStringList(raw?.scope),
    forbiddenScope: normalizeStringList(raw?.forbiddenScope),
    validation: typeof raw?.validation === 'string' ? raw.validation : '',
    ambiguity: normalizeRisk(raw?.ambiguity),
    risk: normalizeRisk(raw?.risk),
    crossCutting: normalizeBoolean(raw?.crossCutting),
    shellHeavy: normalizeBoolean(raw?.shellHeavy),
    needsResume: normalizeBoolean(raw?.needsResume),
    ownerHint: typeof raw?.ownerHint === 'string' ? raw.ownerHint : '',
  };
}

function normalizeInput(raw) {
  return {
    taskAnchor: typeof raw?.taskAnchor === 'string' ? raw.taskAnchor : '',
    delegationAllowed: normalizeBoolean(raw?.delegationAllowed),
    surfaceClear: normalizeBoolean(raw?.surfaceClear),
    branches: Array.isArray(raw?.branches) ? raw.branches.map(normalizeBranch) : [],
  };
}

function chooseModel(branch) {
  if (branch.shape === 'exploratory' || branch.taskKind === 'analysis') {
    return {model: 'gpt-5.4-mini', reasoningEffort: 'medium', ownerRole: 'explorer'};
  }

  if (branch.taskKind === 'tests' && !branch.crossCutting && branch.risk !== 'high') {
    return {model: 'gpt-5.1-codex-mini', reasoningEffort: 'medium', ownerRole: 'worker'};
  }

  if (branch.shellHeavy || (branch.crossCutting && (branch.ambiguity === 'high' || branch.risk === 'high'))) {
    return {model: 'gpt-5.1-codex-max', reasoningEffort: 'high', ownerRole: 'worker'};
  }

  if (branch.taskKind === 'debugging' || branch.taskKind === 'refactor' || branch.shape === 'dependency_ordered') {
    return {model: 'gpt-5.3-codex', reasoningEffort: branch.ambiguity === 'high' ? 'high' : 'medium', ownerRole: 'worker'};
  }

  return {model: 'gpt-5.2-codex', reasoningEffort: branch.ambiguity === 'high' ? 'high' : 'medium', ownerRole: 'worker'};
}

function permittedSkillsForBranch(branch, input) {
  const routed = ['skill-router'];

  if (!input.surfaceClear || branch.shape === 'exploratory') {
    if (branch.ambiguity === 'high') {
      routed.push('exp');
    }
    routed.push('expand-skill');
  }
  if (branch.shape === 'independent_parallel') {
    routed.push('balanced-subagents');
  }
  if (branch.shape === 'dependency_ordered') {
    routed.push('topological-subagents');
  }
  if (branch.needsResume || branch.shape === 'resume_or_revisit') {
    routed.push('thread-memory-bridge', 'branch-artifacts');
  }
  if (branch.needsResume && branch.ambiguity !== 'low') {
    routed.push('session-reload');
  }

  return routed.filter((skill, index, items) =>
    PERMITTED_ROUTED_SKILLS.includes(skill) && items.indexOf(skill) === index);
}

function buildContextPacket(branch, selection, permittedRoutedSkills) {
  return {
    objective: branch.task,
    writeScope: branch.scope,
    forbiddenScope: branch.forbiddenScope,
    validation: branch.validation,
    permittedRoutedSkills,
    whyThisModel: selectModelReason(branch, selection.model),
    whyThisReasoningEffort: selectEffortReason(branch, selection.reasoningEffort),
  };
}

function selectModelReason(branch, model) {
  switch (model) {
  case 'gpt-5.4-mini':
    return 'Use the cheapest exploratory tier because this branch is primarily read-only or surface-finding.';
  case 'gpt-5.1-codex-mini':
    return 'Use the lightweight codex mini tier because this branch is small, local, and mostly assertion or test work.';
  case 'gpt-5.3-codex':
    return 'Use a stronger bounded coding tier because this branch needs more synthesis than the default worker path.';
  case 'gpt-5.1-codex-max':
    return 'Use the max tier because this branch is shell-heavy or cross-cutting enough that a wrong turn would be expensive.';
  default:
    return 'Use the default coding worker tier because this branch is real implementation work but still bounded.';
  }
}

function selectEffortReason(branch, effort) {
  if (effort === 'high') {
    return branch.ambiguity === 'high'
      ? 'Raise effort because the branch is ambiguous and needs extra synthesis.'
      : 'Raise effort because the branch is integration-heavy or operationally risky.';
  }
  return 'Keep the default effort because the branch should be solvable with normal bounded reasoning.';
}

function buildTopLevelRouting(input) {
  const first = ['skill-router'];
  const permitted = ['skill-router'];

  if (!input.surfaceClear) {
    if (input.branches.some((branch) => branch.ambiguity === 'high')) {
      first.push('exp');
      permitted.push('exp');
    }
    first.push('expand-skill');
    permitted.push('expand-skill');
  }

  if (input.branches.some((branch) => branch.shape === 'independent_parallel')) {
    permitted.push('balanced-subagents');
  }
  if (input.branches.some((branch) => branch.shape === 'dependency_ordered')) {
    permitted.push('topological-subagents');
  }
  if (input.branches.some((branch) => branch.needsResume || branch.shape === 'resume_or_revisit')) {
    permitted.push('thread-memory-bridge', 'branch-artifacts', 'session-reload');
  }

  return {
    first,
    permitted: permitted.filter((skill, index, items) =>
      PERMITTED_ROUTED_SKILLS.includes(skill) && items.indexOf(skill) === index),
  };
}

function buildBranchPlan(branch, input) {
  const selection = chooseModel(branch);
  const permittedRoutedSkills = permittedSkillsForBranch(branch, input);
  const contextPacket = buildContextPacket(branch, selection, permittedRoutedSkills);

  return {
    id: branch.id,
    task: branch.task,
    shape: branch.shape,
    taskKind: branch.taskKind,
    ownerRole: branch.ownerHint || selection.ownerRole,
    model: selection.model,
    reasoningEffort: selection.reasoningEffort,
    validation: branch.validation,
    permittedRoutedSkills,
    contextPacket,
    spawnPrompt: [
      `Objective: ${contextPacket.objective}`,
      `Write scope: ${contextPacket.writeScope.join(', ') || '(none specified)'}`,
      `Forbidden scope: ${contextPacket.forbiddenScope.join(', ') || '(none specified)'}`,
      `Validation: ${contextPacket.validation || '(none specified)'}`,
      `Permitted routed skills: ${contextPacket.permittedRoutedSkills.join(', ') || '(none specified)'}`,
      `Why this model: ${contextPacket.whyThisModel}`,
      `Why this reasoning effort: ${contextPacket.whyThisReasoningEffort}`,
    ].join('\n'),
  };
}

export function buildExecutionPlan(rawInput) {
  const input = normalizeInput(rawInput);
  const routing = buildTopLevelRouting(input);

  return {
    taskAnchor: input.taskAnchor,
    delegationAllowed: input.delegationAllowed,
    permissionDecision: input.delegationAllowed ? 'approve_minimum_set' : 'deny_widening',
    routedSkills: routing,
    branches: input.branches.map((branch) => buildBranchPlan(branch, input)),
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
  const plan = buildExecutionPlan(input);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}
