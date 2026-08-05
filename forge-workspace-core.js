(function forgeWorkspaceCore(global) {
  const VERSION = 1;
  const MAX_SNAPSHOTS = 12;
  const MAX_EVENTS = 80;
  const ALLOWED_EVENT_TYPES = new Set([
    'forge_started', 'blueprint_created', 'refinement_changed', 'story_opened',
    'dashboard_opened', 'intelligence_changed', 'workspace_saved',
    'workspace_exported', 'workspace_imported', 'workspace_cleared',
  ]);

  function cleanText(value, maxLength = 500) {
    return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
  }

  function cleanList(value, maxItems = 20, maxLength = 180) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, maxItems).map((item) => cleanText(item, maxLength)).filter(Boolean);
  }

  function normalizeBlueprint(input = {}) {
    const refinements = cleanList(input.refinements, 20, 50);
    return {
      schema: 'crohnoz-forge-blueprint',
      version: VERSION,
      id: cleanText(input.id, 80) || `forge-${Date.now()}`,
      title: cleanText(input.title, 120) || 'Untitled Forge Blueprint',
      idea: cleanText(input.idea, 900),
      audience: cleanText(input.audience, 80),
      format: cleanText(input.format, 80),
      tagline: cleanText(input.tagline, 240),
      summary: cleanText(input.summary, 500),
      users: cleanList(input.users),
      features: cleanList(input.features),
      assumptions: cleanList(input.assumptions),
      workflow: cleanList(input.workflow),
      refinements: [...new Set(refinements)],
      visualDirection: cleanText(input.visualDirection, 60),
      strategicSummary: cleanText(input.strategicSummary, 1500),
      savedAt: Number.isFinite(Number(input.savedAt)) ? Number(input.savedAt) : Date.now(),
      source: cleanText(input.source, 40) || 'local-browser',
    };
  }

  function validateImport(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { valid: false, errors: ['The imported file must contain a JSON object.'] };
    }
    const errors = [];
    if (input.schema !== 'crohnoz-forge-blueprint') errors.push('Unsupported blueprint schema.');
    if (Number(input.version) !== VERSION) errors.push('Unsupported blueprint version.');
    if (!cleanText(input.idea, 900)) errors.push('The blueprint does not contain an idea.');
    if (!cleanText(input.title, 120)) errors.push('The blueprint does not contain a title.');
    return { valid: errors.length === 0, errors, blueprint: errors.length ? null : normalizeBlueprint(input) };
  }

  function addSnapshot(existing, input) {
    const snapshots = Array.isArray(existing) ? existing : [];
    const next = normalizeBlueprint(input);
    const withoutSameId = snapshots.filter((item) => item && item.id !== next.id);
    return [next, ...withoutSameId].slice(0, MAX_SNAPSHOTS);
  }

  function removeSnapshot(existing, id) {
    return (Array.isArray(existing) ? existing : []).filter((item) => item && item.id !== id);
  }

  function createEvent(type, metadata = {}, timestamp = Date.now()) {
    if (!ALLOWED_EVENT_TYPES.has(type)) return null;
    const safeMetadata = {};
    Object.entries(metadata).slice(0, 10).forEach(([key, value]) => {
      const safeKey = cleanText(key, 40).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!safeKey || /idea|email|name|message|description/i.test(safeKey)) return;
      safeMetadata[safeKey] = typeof value === 'number' || typeof value === 'boolean'
        ? value
        : cleanText(value, 80);
    });
    return { type, timestamp: Number(timestamp), metadata: safeMetadata };
  }

  function addEvent(existing, event) {
    if (!event) return Array.isArray(existing) ? existing.slice(0, MAX_EVENTS) : [];
    return [event, ...(Array.isArray(existing) ? existing : [])].slice(0, MAX_EVENTS);
  }

  function summarizeEvents(events) {
    return (Array.isArray(events) ? events : []).reduce((summary, event) => {
      if (event && ALLOWED_EVENT_TYPES.has(event.type)) summary[event.type] = (summary[event.type] || 0) + 1;
      return summary;
    }, {});
  }

  function toMarkdown(input) {
    const blueprint = normalizeBlueprint(input);
    const section = (title, items) => items.length
      ? `\n## ${title}\n${items.map((item) => `- ${item}`).join('\n')}\n`
      : '';
    return `# ${blueprint.title}\n\n> ${blueprint.tagline || 'Exploratory product blueprint'}\n\n${blueprint.summary}\n\n## Original idea\n${blueprint.idea}\n\n## Product context\n- Audience: ${blueprint.audience || 'To validate'}\n- Format: ${blueprint.format || 'To validate'}\n- Visual direction: ${blueprint.visualDirection || 'Default'}\n- Saved locally: ${new Date(blueprint.savedAt).toISOString()}\n${section('Users', blueprint.users)}${section('First-release features', blueprint.features)}${section('Workflow', blueprint.workflow)}${section('Open assumptions', blueprint.assumptions)}${section('Selected refinements', blueprint.refinements)}\n## Evidence status\nThis document is an exploratory blueprint. Features, feasibility, effort, adoption, compliance, and commercial outcomes require human validation.\n`;
  }

  global.ForgeWorkspaceCore = {
    VERSION, MAX_SNAPSHOTS, MAX_EVENTS, normalizeBlueprint, validateImport,
    addSnapshot, removeSnapshot, createEvent, addEvent, summarizeEvents, toMarkdown,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = global.ForgeWorkspaceCore;
}(typeof window !== 'undefined' ? window : globalThis));
