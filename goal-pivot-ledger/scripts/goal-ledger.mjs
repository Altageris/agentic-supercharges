const fs = await import('node:fs');
const path = await import('node:path');
const {fileURLToPath} = await import('node:url');

export const GOAL_ENTRY_STATUSES = Object.freeze([
  'proposed',
  'blocked',
  'deferred',
  'active',
  'rerouted',
  'completed',
  'superseded',
]);

export const GOAL_PIVOT_DECISIONS = Object.freeze([
  'allow',
  'block',
  'defer',
  'reroute',
]);

export const DEPENDENCY_KINDS = Object.freeze([
  'prerequisite',
  'contract',
  'blocker',
  'external_wait',
  'owner_handoff',
  'validated_artifact',
  'invariant',
  'contact_surface',
  'resume_anchor',
]);

export const DEPENDENCY_STATES = Object.freeze([
  'unknown',
  'open',
  'blocked',
  'pending',
  'validated',
  'resolved',
  'satisfied',
]);

const CLOSED_DEPENDENCY_STATES = new Set(['validated', 'resolved', 'satisfied']);

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

function normalizeLaunchResult(raw) {
  return {
    id: typeof raw?.id === 'string' ? raw.id : '',
    launched: Boolean(raw?.launched),
    decision: typeof raw?.decision === 'string' ? raw.decision : '',
    reasons: normalizeStringList(raw?.reasons),
  };
}

export function defaultLedgerPath() {
  const homeDir = (typeof process !== 'undefined' && (process.env.USERPROFILE || process.env.HOME))
    || 'C:/Users/jeanj';
  return path.join(homeDir, '.codex', 'memories', 'skills', 'goal-pivot-ledger', 'GOAL_LEDGER.jsonl');
}

export function createGoalId(goalText = 'goal') {
  const slug = String(goalText)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'goal';
  return `goal-${Date.now()}-${slug}`;
}

export function createGoalEntry(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    goalId: '',
    parentGoalId: '',
    taskAnchor: '',
    requestedGoal: '',
    activeGoal: '',
    priorGoal: '',
    status: 'proposed',
    pivotReason: '',
    dependsOn: [],
    hardConstraints: [],
    blockedBy: [],
    resumeAnchor: '',
    decision: '',
    decisionReasons: [],
    policyMode: '',
    coordinatorTaskSet: null,
    launchResults: [],
    ...overrides,
  };
}

export function normalizeGoalEntry(value) {
  const entry = createGoalEntry(value);
  return {
    ...entry,
    timestamp: typeof entry.timestamp === 'string' && entry.timestamp ? entry.timestamp : new Date().toISOString(),
    goalId: typeof entry.goalId === 'string' ? entry.goalId : '',
    parentGoalId: typeof entry.parentGoalId === 'string' ? entry.parentGoalId : '',
    taskAnchor: typeof entry.taskAnchor === 'string' ? entry.taskAnchor : '',
    requestedGoal: typeof entry.requestedGoal === 'string' ? entry.requestedGoal : '',
    activeGoal: typeof entry.activeGoal === 'string' ? entry.activeGoal : '',
    priorGoal: typeof entry.priorGoal === 'string' ? entry.priorGoal : '',
    status: GOAL_ENTRY_STATUSES.includes(entry.status) ? entry.status : 'proposed',
    pivotReason: typeof entry.pivotReason === 'string' ? entry.pivotReason : '',
    dependsOn: Array.isArray(entry.dependsOn) ? entry.dependsOn.map(normalizeDependency) : [],
    hardConstraints: normalizeStringList(entry.hardConstraints),
    blockedBy: normalizeStringList(entry.blockedBy),
    resumeAnchor: typeof entry.resumeAnchor === 'string' ? entry.resumeAnchor : '',
    decision: GOAL_PIVOT_DECISIONS.includes(entry.decision) ? entry.decision : '',
    decisionReasons: normalizeStringList(entry.decisionReasons),
    policyMode: typeof entry.policyMode === 'string' ? entry.policyMode : '',
    coordinatorTaskSet: entry.coordinatorTaskSet && typeof entry.coordinatorTaskSet === 'object'
      ? entry.coordinatorTaskSet
      : null,
    launchResults: Array.isArray(entry.launchResults)
      ? entry.launchResults.map(normalizeLaunchResult)
      : [],
  };
}

export function isGoalEntry(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof value.timestamp === 'string'
    && typeof value.goalId === 'string'
    && typeof value.requestedGoal === 'string'
    && typeof value.activeGoal === 'string'
    && typeof value.priorGoal === 'string'
    && GOAL_ENTRY_STATUSES.includes(value.status)
    && Array.isArray(value.dependsOn)
    && value.dependsOn.every((dependency) =>
      dependency
      && typeof dependency === 'object'
      && DEPENDENCY_KINDS.includes(dependency.kind)
      && typeof dependency.target === 'string'
      && DEPENDENCY_STATES.includes(dependency.state)
      && typeof dependency.hard === 'boolean')
    && typeof value.resumeAnchor === 'string'
    && typeof value.decision === 'string'
    && (value.decision === '' || GOAL_PIVOT_DECISIONS.includes(value.decision))
    && Array.isArray(value.decisionReasons)
    && Array.isArray(value.launchResults);
}

export function dependencyIsClosed(dependency) {
  return Boolean(dependency) && CLOSED_DEPENDENCY_STATES.has(dependency.state);
}

export function loadGoalLedger(ledgerPath = defaultLedgerPath()) {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const text = fs.readFileSync(ledgerPath, 'utf8').replace(/^\uFEFF/, '');
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => normalizeGoalEntry(JSON.parse(line)));
}

export function appendGoalEntry(entry, ledgerPath = defaultLedgerPath()) {
  const normalized = normalizeGoalEntry(entry);
  fs.mkdirSync(path.dirname(ledgerPath), {recursive: true});
  fs.appendFileSync(ledgerPath, `${JSON.stringify(normalized)}\n`, 'utf8');
  return {
    ledgerPath,
    entry: normalized,
  };
}

export function findActiveGoal(entries) {
  return [...entries].reverse().find((entry) =>
    entry.status === 'active' || entry.status === 'rerouted') || null;
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
  const result = appendGoalEntry(input, process.argv[3] || defaultLedgerPath());
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
