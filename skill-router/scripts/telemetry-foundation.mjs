export const TELEMETRY_TRAFFIC_REASONS = Object.freeze([
  'prompt_or_context_overhead',
  'coordination_or_handoff_cost',
  'tool_churn',
  'drift_risk_from_widening',
]);

export const TELEMETRY_SURFACES = Object.freeze([
  'file',
  'command',
  'branch',
  'artifact',
]);

export const TELEMETRY_PERMISSION_DECISIONS = Object.freeze([
  'approve_minimum_set',
  'approve_follow_on',
  'defer_follow_on',
  'deny_widening',
]);

function normalizeStringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];
}

function normalizeTrafficReason(reason) {
  if (typeof reason === 'string') {
    return TELEMETRY_TRAFFIC_REASONS.includes(reason) ? {reason, detail: ''} : null;
  }
  if (!reason || typeof reason !== 'object') {
    return null;
  }

  const normalizedReason = TELEMETRY_TRAFFIC_REASONS.includes(reason.reason)
    ? reason.reason
    : '';
  if (!normalizedReason) {
    return null;
  }

  return {
    reason: normalizedReason,
    detail: typeof reason.detail === 'string' ? reason.detail : '',
  };
}

function normalizeImmediateSurface(surface) {
  if (!surface || typeof surface !== 'object') {
    return {kind: '', value: ''};
  }

  return {
    kind: TELEMETRY_SURFACES.includes(surface.kind) ? surface.kind : '',
    value: typeof surface.value === 'string' ? surface.value : '',
  };
}

export function createTelemetryRecord(overrides = {}) {
  return {
    taskAnchor: '',
    firstApprovedSkill: '',
    approvedFollowOnSkills: [],
    deferredSkills: [],
    trafficReasons: [],
    permissionDecision: '',
    immediateSurfaceChosen: {
      kind: '',
      value: '',
    },
    ...overrides,
  };
}

export function normalizeTelemetryRecord(value) {
  const record = createTelemetryRecord(value);
  return {
    ...record,
    taskAnchor: typeof record.taskAnchor === 'string' ? record.taskAnchor : '',
    firstApprovedSkill: typeof record.firstApprovedSkill === 'string' ? record.firstApprovedSkill : '',
    approvedFollowOnSkills: normalizeStringList(record.approvedFollowOnSkills),
    deferredSkills: normalizeStringList(record.deferredSkills),
    trafficReasons: Array.isArray(record.trafficReasons)
      ? record.trafficReasons.map(normalizeTrafficReason).filter(Boolean)
      : [],
    permissionDecision: TELEMETRY_PERMISSION_DECISIONS.includes(record.permissionDecision)
      ? record.permissionDecision
      : '',
    immediateSurfaceChosen: normalizeImmediateSurface(record.immediateSurfaceChosen),
  };
}

export function isTelemetryRecord(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof value.taskAnchor === 'string'
    && typeof value.firstApprovedSkill === 'string'
    && Array.isArray(value.approvedFollowOnSkills)
    && Array.isArray(value.deferredSkills)
    && Array.isArray(value.trafficReasons)
    && value.trafficReasons.every((reason) =>
      reason
      && typeof reason === 'object'
      && TELEMETRY_TRAFFIC_REASONS.includes(reason.reason)
      && typeof reason.detail === 'string')
    && typeof value.permissionDecision === 'string'
    && TELEMETRY_PERMISSION_DECISIONS.includes(value.permissionDecision)
    && value.immediateSurfaceChosen
    && typeof value.immediateSurfaceChosen === 'object'
    && TELEMETRY_SURFACES.includes(value.immediateSurfaceChosen.kind)
    && typeof value.immediateSurfaceChosen.value === 'string';
}
