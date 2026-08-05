((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CrohnozForgeWorkspaceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const SCHEMA_VERSION = 1;
  const MAX_IDEA_LENGTH = 900;
  const MAX_SHORT_TEXT = 180;
  const MAX_LIST_ITEMS = 24;
  const MAX_LIST_ITEM_LENGTH = 240;

  const ALLOWED_REFINEMENTS = new Set([
    'simpler',
    'mobile',
    'qr',
    'ai',
    'saas',
    'payments',
    'no-registration',
    'inventory',
    'dashboards',
    'multi-org',
    'accessible',
    'visual-alt',
  ]);

  const ALLOWED_VISUAL_DIRECTIONS = new Set([
    'precision-grid',
    'warm-service',
    'field-utility',
  ]);

  function cleanText(value, maxLength = MAX_SHORT_TEXT) {
    return String(value ?? '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function cleanList(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => cleanText(item, MAX_LIST_ITEM_LENGTH))
      .filter(Boolean))];
  }

  function cleanRefinements(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value
      .map((item) => cleanText(item, 40))
      .filter((item) => ALLOWED_REFINEMENTS.has(item)))];
  }

  function cleanVisualDirection(value) {
    const direction = cleanText(value, 40);
    return ALLOWED_VISUAL_DIRECTIONS.has(direction) ? direction : null;
  }

  function validDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function createChecksum(value) {
    const input = typeof value === 'string' ? value : JSON.stringify(value);
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function normalizeSnapshot(input = {}) {
    const product = input.product || {};
    const blueprint = input.blueprint || {};
    const review = input.review || {};
    const metadata = input.metadata || {};

    const normalized = {
      schema: 'crohnoz-forge-blueprint',
      schemaVersion: SCHEMA_VERSION,
      createdAt: validDate(input.createdAt),
      updatedAt: validDate(input.updatedAt || input.createdAt),
      product: {
        idea: cleanText(product.idea, MAX_IDEA_LENGTH),
        audience: cleanText(product.audience, 80),
        format: cleanText(product.format, 80),
        goal: cleanText(product.goal, 120),
        currentMethod: cleanText(product.currentMethod, 120),
        refinements: cleanRefinements(product.refinements),
        visualDirection: cleanVisualDirection(product.visualDirection),
      },
      blueprint: {
        name: cleanText(blueprint.name, 100),
        tagline: cleanText(blueprint.tagline, 260),
        summary: cleanText(blueprint.summary, 520),
        users: cleanList(blueprint.users),
        features: cleanList(blueprint.features),
        assumptions: cleanList(blueprint.assumptions),
        workflow: cleanList(blueprint.workflow),
        validationQuestions: cleanList(blueprint.validationQuestions),
        risks: cleanList(blueprint.risks),
        deliveryPhases: cleanList(blueprint.deliveryPhases),
      },
      review: {
        privacyReviewed: Boolean(review.privacyReviewed),
        accessibilityReviewed: Boolean(review.accessibilityReviewed),
        evidenceReviewed: Boolean(review.evidenceReviewed),
        ownerAssigned: Boolean(review.ownerAssigned),
        notes: cleanText(review.notes, 1200),
      },
      metadata: {
        source: cleanText(metadata.source || 'browser-workspace', 80),
        appVersion: cleanText(metadata.appVersion || 'unknown', 40),
        localOnly: true,
        containsSecrets: false,
      },
    };

    normalized.checksum = createChecksum({
      product: normalized.product,
      blueprint: normalized.blueprint,
      review: normalized.review,
    });

    return normalized;
  }

  function validateSnapshot(candidate) {
    const errors = [];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return { valid: false, errors: ['The imported file must contain a JSON object.'], snapshot: null };
    }

    if (candidate.schema !== 'crohnoz-forge-blueprint') {
      errors.push('The file is not a Crohnoz Forge blueprint export.');
    }

    if (Number(candidate.schemaVersion) !== SCHEMA_VERSION) {
      errors.push(`Unsupported blueprint schema version. Expected ${SCHEMA_VERSION}.`);
    }

    const snapshot = normalizeSnapshot(candidate);
    if (snapshot.product.idea.length < 18) {
      errors.push('The blueprint idea is too short to restore safely.');
    }

    if (!snapshot.product.audience) errors.push('The blueprint audience is missing.');
    if (!snapshot.product.format) errors.push('The blueprint format is missing.');

    if (candidate.checksum) {
      const expected = createChecksum({
        product: snapshot.product,
        blueprint: snapshot.blueprint,
        review: snapshot.review,
      });
      if (cleanText(candidate.checksum, 80) !== expected) {
        errors.push('The blueprint checksum does not match its normalized content.');
      }
    }

    return { valid: errors.length === 0, errors, snapshot };
  }

  function serializeSnapshot(snapshot) {
    const normalized = normalizeSnapshot(snapshot);
    return JSON.stringify(normalized, null, 2);
  }

  function parseSnapshot(text) {
    if (typeof text !== 'string' || text.length > 300000) {
      return { valid: false, errors: ['The imported file is empty or too large.'], snapshot: null };
    }

    try {
      return validateSnapshot(JSON.parse(text));
    } catch {
      return { valid: false, errors: ['The imported file is not valid JSON.'], snapshot: null };
    }
  }

  function calculateReadiness(snapshot) {
    const normalized = normalizeSnapshot(snapshot);
    const checks = [
      {
        key: 'problem',
        label: 'Problem is specific enough to test',
        complete: normalized.product.idea.length >= 60,
      },
      {
        key: 'context',
        label: 'Audience, format, goal, and current method are defined',
        complete: Boolean(
          normalized.product.audience
          && normalized.product.format
          && normalized.product.goal
          && normalized.product.currentMethod,
        ),
      },
      {
        key: 'workflow',
        label: 'A critical workflow and first-release features are visible',
        complete: normalized.blueprint.workflow.length >= 3 && normalized.blueprint.features.length >= 3,
      },
      {
        key: 'validation',
        label: 'Open assumptions and validation questions are documented',
        complete: normalized.blueprint.assumptions.length >= 2 && normalized.blueprint.validationQuestions.length >= 2,
      },
      {
        key: 'privacy',
        label: 'Privacy and data handling received human review',
        complete: normalized.review.privacyReviewed,
      },
      {
        key: 'accessibility',
        label: 'Accessibility requirements received human review',
        complete: normalized.review.accessibilityReviewed,
      },
      {
        key: 'evidence',
        label: 'Claims and evidence labels received human review',
        complete: normalized.review.evidenceReviewed,
      },
      {
        key: 'ownership',
        label: 'A person owns the next experiment',
        complete: normalized.review.ownerAssigned,
      },
    ];

    const completeCount = checks.filter((check) => check.complete).length;
    const score = Math.round((completeCount / checks.length) * 100);
    const classification = score >= 88
      ? 'Review-ready'
      : score >= 63
        ? 'Needs focused review'
        : 'Still exploratory';

    return { score, classification, checks, completeCount, total: checks.length };
  }

  function buildPlainTextSummary(snapshot) {
    const normalized = normalizeSnapshot(snapshot);
    const lines = [
      `# ${normalized.blueprint.name || 'Crohnoz Forge Blueprint'}`,
      '',
      normalized.blueprint.tagline || normalized.blueprint.summary,
      '',
      `Problem: ${normalized.product.idea}`,
      `Audience: ${normalized.product.audience}`,
      `Format: ${normalized.product.format}`,
      `Primary outcome: ${normalized.product.goal || 'Not yet defined'}`,
      `Current method: ${normalized.product.currentMethod || 'Not yet defined'}`,
      `Refinements: ${normalized.product.refinements.join(', ') || 'None selected'}`,
      '',
      '## First-release features',
      ...normalized.blueprint.features.map((item) => `- ${item}`),
      '',
      '## Critical workflow',
      ...normalized.blueprint.workflow.map((item, index) => `${index + 1}. ${item}`),
      '',
      '## Open assumptions',
      ...normalized.blueprint.assumptions.map((item) => `- ${item}`),
      '',
      '## Validation questions',
      ...normalized.blueprint.validationQuestions.map((item) => `- ${item}`),
      '',
      'Exploratory output. Human validation is required before implementation or commercial claims.',
    ];

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  return {
    SCHEMA_VERSION,
    ALLOWED_REFINEMENTS: [...ALLOWED_REFINEMENTS],
    ALLOWED_VISUAL_DIRECTIONS: [...ALLOWED_VISUAL_DIRECTIONS],
    cleanText,
    createChecksum,
    normalizeSnapshot,
    validateSnapshot,
    serializeSnapshot,
    parseSnapshot,
    calculateReadiness,
    buildPlainTextSummary,
  };
});
