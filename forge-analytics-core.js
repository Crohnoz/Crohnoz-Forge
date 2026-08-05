((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CrohnozForgeAnalyticsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const SCHEMA_VERSION = 1;
  const RETENTION_DAYS = 30;

  const ALLOWED_EVENTS = new Set([
    'forge_started',
    'forge_completed',
    'sample_selected',
    'refinement_changed',
    'preview_opened',
    'story_opened',
    'dashboard_filtered',
    'simulator_changed',
    'workspace_saved',
    'workspace_exported',
    'workspace_imported',
    'review_check_changed',
  ]);

  const ALLOWED_METADATA = {
    sample_selected: new Set(['sample']),
    refinement_changed: new Set(['count', 'visualDirection']),
    preview_opened: new Set(['screen']),
    story_opened: new Set(['category', 'outcomeType']),
    dashboard_filtered: new Set(['status', 'privacy']),
    simulator_changed: new Set(['complexity', 'preset']),
    workspace_imported: new Set(['schemaVersion']),
    review_check_changed: new Set(['check', 'complete']),
  };

  const FORBIDDEN_KEY_PATTERN = /(idea|description|problem|name|email|phone|message|notes?|title|organization|company|client|userText|raw)/i;

  function cleanScalar(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(-1000000, Math.min(1000000, value));
    if (typeof value === 'string') {
      return value
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
    }
    return null;
  }

  function sanitizeMetadata(eventType, metadata = {}) {
    const allowed = ALLOWED_METADATA[eventType];
    if (!allowed || !metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};

    return Object.entries(metadata).reduce((result, [key, value]) => {
      if (!allowed.has(key) || FORBIDDEN_KEY_PATTERN.test(key)) return result;
      const cleaned = cleanScalar(value);
      if (cleaned !== null && cleaned !== '') result[key] = cleaned;
      return result;
    }, {});
  }

  function createState(input = {}) {
    const createdAt = validDate(input.createdAt);
    return {
      schema: 'crohnoz-forge-local-analytics',
      schemaVersion: SCHEMA_VERSION,
      consent: Boolean(input.consent),
      createdAt,
      updatedAt: validDate(input.updatedAt || createdAt),
      retentionDays: RETENTION_DAYS,
      eventCounts: normalizeCounts(input.eventCounts),
      refinements: normalizeCounts(input.refinements),
      previewScreens: normalizeCounts(input.previewScreens),
      storyCategories: normalizeCounts(input.storyCategories),
      sessionCount: clampInteger(input.sessionCount, 0, 100000),
      lastVisualDirection: cleanScalar(input.lastVisualDirection),
      storage: 'local-browser-only',
      networkTransmission: false,
    };
  }

  function validDate(value) {
    const date = new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function clampInteger(value, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return minimum;
    return Math.max(minimum, Math.min(maximum, Math.round(number)));
  }

  function normalizeCounts(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    return Object.entries(input).slice(0, 100).reduce((result, [key, value]) => {
      const safeKey = cleanScalar(key);
      if (!safeKey || FORBIDDEN_KEY_PATTERN.test(safeKey)) return result;
      result[safeKey] = clampInteger(value, 0, 1000000);
      return result;
    }, {});
  }

  function isExpired(state, now = Date.now()) {
    const created = new Date(state.createdAt).getTime();
    if (Number.isNaN(created)) return true;
    return now - created > RETENTION_DAYS * 24 * 60 * 60 * 1000;
  }

  function increment(target, key) {
    if (!key) return;
    target[key] = clampInteger((target[key] || 0) + 1, 0, 1000000);
  }

  function recordEvent(inputState, eventType, metadata = {}, now = Date.now()) {
    let state = createState(inputState);
    if (isExpired(state, now)) {
      state = createState({ consent: state.consent, createdAt: new Date(now).toISOString(), sessionCount: 1 });
    }

    if (!state.consent || !ALLOWED_EVENTS.has(eventType)) return state;

    const safeMetadata = sanitizeMetadata(eventType, metadata);
    increment(state.eventCounts, eventType);

    if (eventType === 'refinement_changed') {
      const count = clampInteger(safeMetadata.count, 0, 20);
      increment(state.refinements, String(count));
      if (safeMetadata.visualDirection) state.lastVisualDirection = safeMetadata.visualDirection;
    }

    if (eventType === 'preview_opened' && safeMetadata.screen) {
      increment(state.previewScreens, safeMetadata.screen);
    }

    if (eventType === 'story_opened' && safeMetadata.category) {
      increment(state.storyCategories, safeMetadata.category);
    }

    state.updatedAt = new Date(now).toISOString();
    return state;
  }

  function setConsent(inputState, consent, now = Date.now()) {
    const state = createState(inputState);
    state.consent = Boolean(consent);
    state.updatedAt = new Date(now).toISOString();
    if (state.consent && state.sessionCount === 0) state.sessionCount = 1;
    return state;
  }

  function clearState(consent = false, now = Date.now()) {
    return createState({
      consent,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      sessionCount: consent ? 1 : 0,
    });
  }

  function summarize(inputState) {
    const state = createState(inputState);
    const totalEvents = Object.values(state.eventCounts).reduce((sum, value) => sum + value, 0);
    const topEvent = Object.entries(state.eventCounts)
      .sort((left, right) => right[1] - left[1])[0] || null;
    const topPreview = Object.entries(state.previewScreens)
      .sort((left, right) => right[1] - left[1])[0] || null;

    return {
      consent: state.consent,
      totalEvents,
      topEvent,
      topPreview,
      eventCounts: { ...state.eventCounts },
      refinements: { ...state.refinements },
      previewScreens: { ...state.previewScreens },
      storyCategories: { ...state.storyCategories },
      retentionDays: state.retentionDays,
      storage: state.storage,
      networkTransmission: state.networkTransmission,
      updatedAt: state.updatedAt,
    };
  }

  function serializeState(inputState) {
    return JSON.stringify(createState(inputState), null, 2);
  }

  function parseState(text) {
    if (typeof text !== 'string' || text.length > 100000) return clearState(false);
    try {
      const candidate = JSON.parse(text);
      if (candidate?.schema !== 'crohnoz-forge-local-analytics') return clearState(false);
      return createState(candidate);
    } catch {
      return clearState(false);
    }
  }

  return {
    SCHEMA_VERSION,
    RETENTION_DAYS,
    ALLOWED_EVENTS: [...ALLOWED_EVENTS],
    sanitizeMetadata,
    createState,
    recordEvent,
    setConsent,
    clearState,
    summarize,
    serializeState,
    parseState,
    isExpired,
  };
});
