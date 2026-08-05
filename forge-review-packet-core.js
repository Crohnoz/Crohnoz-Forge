((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CrohnozForgeReviewPacketCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const PACKET_VERSION = 1;
  const MODES = new Set(['internal', 'client', 'public-safe']);
  const AUDIENCES = new Set(['internal-review', 'client-workshop', 'implementation-handoff']);
  const SECTIONS = new Set(['scope', 'decisions', 'risks', 'validation', 'delivery', 'evidence', 'signoff']);

  const refinementDecisions = {
    simpler: 'Keep the first release focused on one measurable critical path.',
    mobile: 'Design the primary workflow for small screens and constrained field conditions.',
    qr: 'Use QR identity only at meaningful custody, batch, asset, or location events.',
    ai: 'Keep AI recommendations explainable, auditable, and subject to human approval.',
    saas: 'Separate reusable platform capabilities from organization-specific configuration.',
    payments: 'Define payment states, reversals, receipts, taxes, and reconciliation before implementation.',
    'no-registration': 'Allow guest entry only for low-risk actions and introduce verification before sensitive operations.',
    inventory: 'Treat inventory as an auditable movement ledger rather than a decorative stock counter.',
    dashboards: 'Connect each dashboard metric to an owner, threshold, and operational action.',
    'multi-org': 'Enforce tenant isolation for records, roles, configuration, and audit history.',
    accessible: 'Include keyboard, contrast, motion, touch-target, label, and cognitive-load requirements in acceptance criteria.',
    'visual-alt': 'Validate visual direction without changing purpose, information architecture, or accessibility.',
  };

  function cleanText(value, maxLength = 1200) {
    return String(value ?? '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function cleanList(value, maximum = 30) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.slice(0, maximum).map((item) => cleanText(item, 320)).filter(Boolean))];
  }

  function normalizeOptions(input = {}) {
    const mode = MODES.has(input.mode) ? input.mode : 'internal';
    const audience = AUDIENCES.has(input.audience) ? input.audience : 'internal-review';
    const requestedSections = Array.isArray(input.sections) ? input.sections : [...SECTIONS];
    const sections = [...new Set(requestedSections.filter((section) => SECTIONS.has(section)))];
    return {
      mode,
      audience,
      sections: sections.length ? sections : [...SECTIONS],
      includeRawProblem: mode !== 'public-safe' && input.includeRawProblem !== false,
      includeReviewNotes: mode === 'internal' && Boolean(input.includeReviewNotes),
    };
  }

  function snapshotValue(snapshot, path, fallback = '') {
    return path.reduce((value, key) => value?.[key], snapshot) ?? fallback;
  }

  function deriveRisks(snapshot) {
    const supplied = cleanList(snapshotValue(snapshot, ['blueprint', 'risks'], []));
    if (supplied.length) return supplied;

    const refinements = cleanList(snapshotValue(snapshot, ['product', 'refinements'], []));
    const risks = [
      'Adoption risk: the proposed workflow still requires representative-user validation.',
      'Measurement risk: current baselines and success thresholds may be incomplete.',
      'Delivery risk: browser-level, mobile, and deployment verification remain separate release gates.',
    ];
    if (refinements.includes('ai')) risks.push('AI risk: data suitability, evaluation, explainability, and human override require dedicated review.');
    if (refinements.includes('payments')) risks.push('Financial risk: reconciliation, reversals, provider responsibility, and tax treatment require validation.');
    if (refinements.includes('multi-org') || refinements.includes('saas')) risks.push('Isolation risk: organization boundaries and role scopes require security testing.');
    if (refinements.includes('no-registration')) risks.push('Access risk: guest entry must not expose sensitive records or privileged actions.');
    return risks;
  }

  function deriveDecisions(snapshot) {
    const refinements = cleanList(snapshotValue(snapshot, ['product', 'refinements'], []));
    const decisions = refinements.map((key) => refinementDecisions[key]).filter(Boolean);
    if (!decisions.length) decisions.push('Keep the first release exploratory until the critical workflow and measurable outcome are validated.');
    decisions.push('Treat all generated recommendations as hypotheses requiring accountable human review.');
    return [...new Set(decisions)];
  }

  function deriveNonGoals(snapshot) {
    const refinements = cleanList(snapshotValue(snapshot, ['product', 'refinements'], []));
    const nonGoals = [
      'Do not represent exploratory metrics as guaranteed savings, feasibility, or commercial results.',
      'Do not publish submitted ideas, participant identity, screenshots, or figures without explicit consent.',
      'Do not expand secondary workflows before the first measurable critical path is tested.',
    ];
    if (!refinements.includes('ai')) nonGoals.push('AI-assisted decisions are outside the current first-release boundary.');
    if (!refinements.includes('payments')) nonGoals.push('Payment processing and financial reconciliation are outside the current first-release boundary.');
    if (!refinements.includes('multi-org') && !refinements.includes('saas')) nonGoals.push('Multi-tenant platform operation is outside the current first-release boundary.');
    return nonGoals;
  }

  function buildGates(snapshot) {
    const review = snapshotValue(snapshot, ['review'], {});
    const product = snapshotValue(snapshot, ['product'], {});
    const blueprint = snapshotValue(snapshot, ['blueprint'], {});
    const ideaLength = cleanText(product.idea, 900).length;
    const validationCount = cleanList(blueprint.validationQuestions).length;
    const featureCount = cleanList(blueprint.features).length;
    const workflowCount = cleanList(blueprint.workflow).length;

    return [
      { key: 'problem', label: 'Problem and intended outcome are specific enough for a controlled test', status: ideaLength >= 60 ? 'ready-for-review' : 'pending' },
      { key: 'scope', label: 'Critical workflow and first-release scope are visible', status: featureCount >= 3 && workflowCount >= 3 ? 'ready-for-review' : 'pending' },
      { key: 'validation', label: 'Validation questions and evidence signals are documented', status: validationCount >= 2 ? 'ready-for-review' : 'pending' },
      { key: 'privacy', label: 'Privacy and data handling received accountable human review', status: review.privacyReviewed ? 'confirmed' : 'pending' },
      { key: 'accessibility', label: 'Accessibility requirements received accountable human review', status: review.accessibilityReviewed ? 'confirmed' : 'pending' },
      { key: 'evidence', label: 'Claims, metrics, and evidence labels received accountable human review', status: review.evidenceReviewed ? 'confirmed' : 'pending' },
      { key: 'ownership', label: 'A person owns the next experiment and decision date', status: review.ownerAssigned ? 'confirmed' : 'pending' },
      { key: 'deployment', label: 'Desktop, mobile, browser, form, and deployment verification completed', status: 'pending-environment-verification' },
    ];
  }

  function buildSignoff(gates) {
    const statusFor = (key) => gates.find((gate) => gate.key === key)?.status || 'pending';
    return [
      { role: 'Product owner', responsibility: 'Problem, scope, expected outcome, and next decision', status: statusFor('ownership') },
      { role: 'Technical reviewer', responsibility: 'Architecture, feasibility, security boundaries, and deployment plan', status: 'pending' },
      { role: 'Privacy reviewer', responsibility: 'Data inventory, lawful handling, retention, publication, and deletion', status: statusFor('privacy') },
      { role: 'Accessibility reviewer', responsibility: 'Keyboard, contrast, motion, labels, touch targets, and representative testing', status: statusFor('accessibility') },
      { role: 'Evidence reviewer', responsibility: 'Baseline, measurement method, source labels, and claim wording', status: statusFor('evidence') },
      { role: 'Release owner', responsibility: 'Browser, mobile, forms, observability, rollback, and production verification', status: statusFor('deployment') },
    ];
  }

  function buildReviewPacket(snapshot = {}, rawOptions = {}) {
    const options = normalizeOptions(rawOptions);
    const blueprint = snapshotValue(snapshot, ['blueprint'], {});
    const product = snapshotValue(snapshot, ['product'], {});
    const review = snapshotValue(snapshot, ['review'], {});
    const publicSafe = options.mode === 'public-safe';
    const gates = buildGates(snapshot);

    const packet = {
      schema: 'crohnoz-forge-review-packet',
      schemaVersion: PACKET_VERSION,
      generatedAt: new Date().toISOString(),
      mode: options.mode,
      audience: options.audience,
      confidentiality: publicSafe ? 'Public-safe draft; still requires publication approval' : options.mode === 'client' ? 'Client review draft' : 'Internal review draft',
      sourceBoundary: 'Generated from the current browser blueprint. No analytics dataset is included.',
      product: {
        name: cleanText(blueprint.name, 120) || 'Crohnoz Forge concept',
        tagline: cleanText(blueprint.tagline, 360),
        summary: publicSafe
          ? cleanText(blueprint.tagline || 'A proposed digital workflow concept requiring validation.', 360)
          : cleanText(blueprint.summary, 800),
        rawProblem: options.includeRawProblem ? cleanText(product.idea, 900) : null,
        audience: cleanText(product.audience, 100),
        format: cleanText(product.format, 100),
        outcome: cleanText(product.goal, 160),
        currentMethod: publicSafe ? null : cleanText(product.currentMethod, 160),
        refinements: cleanList(product.refinements),
        visualDirection: cleanText(product.visualDirection, 50) || null,
      },
      sections: {
        scope: options.sections.includes('scope') ? {
          firstReleaseFeatures: cleanList(blueprint.features),
          criticalWorkflow: cleanList(blueprint.workflow),
          nonGoals: deriveNonGoals(snapshot),
        } : null,
        decisions: options.sections.includes('decisions') ? deriveDecisions(snapshot) : null,
        risks: options.sections.includes('risks') ? deriveRisks(snapshot) : null,
        validation: options.sections.includes('validation') ? {
          assumptions: cleanList(blueprint.assumptions),
          questions: cleanList(blueprint.validationQuestions),
          evidenceBoundary: 'Metrics and outcomes remain exploratory until their source, baseline, method, and reviewer are documented.',
        } : null,
        delivery: options.sections.includes('delivery') ? {
          phases: cleanList(blueprint.deliveryPhases).length ? cleanList(blueprint.deliveryPhases) : [
            'Discovery confirmation and data-boundary review',
            'Task-focused prototype with representative users',
            'Controlled MVP pilot with measurable baseline',
            'Evidence review and scope decision',
            'Production-readiness review before deployment',
          ],
          gates,
        } : null,
        evidence: options.sections.includes('evidence') ? {
          status: review.evidenceReviewed ? 'Human evidence review marked complete in the local workspace' : 'Human evidence review remains pending',
          restrictions: [
            'Do not convert capacity scenarios into guaranteed cash savings.',
            'Keep client-reported, system-measured, and assumed evidence distinguishable.',
            'Do not publish identity, figures, screenshots, or outcomes without explicit approval.',
          ],
        } : null,
        signoff: options.sections.includes('signoff') ? buildSignoff(gates) : null,
      },
      reviewNotes: options.includeReviewNotes ? cleanText(review.notes, 1200) : null,
      nextDecision: 'Run the smallest representative validation step, review evidence and risks, then decide whether to continue, narrow, revise, or stop.',
      disclaimer: 'Exploratory review artifact. It does not establish feasibility, compliance, approval, publication consent, implementation readiness, or commercial outcome.',
    };

    return packet;
  }

  function sectionHeading(title) {
    return `\n## ${title}\n`;
  }

  function bulletList(items) {
    return items?.length ? items.map((item) => `- ${item}`).join('\n') : '- Not yet documented';
  }

  function packetToMarkdown(packet) {
    const lines = [
      `# ${packet.product.name} — Forge Review Packet`,
      '',
      `**Mode:** ${packet.mode}`,
      `**Audience:** ${packet.audience}`,
      `**Classification:** ${packet.confidentiality}`,
      `**Generated:** ${packet.generatedAt}`,
      '',
      packet.sourceBoundary,
      '',
      packet.product.tagline || packet.product.summary,
    ];

    if (packet.product.rawProblem) lines.push(sectionHeading('Problem context'), packet.product.rawProblem);
    lines.push(sectionHeading('Product context'));
    lines.push(`- Audience: ${packet.product.audience || 'Not yet defined'}`);
    lines.push(`- Format: ${packet.product.format || 'Not yet defined'}`);
    lines.push(`- Intended outcome: ${packet.product.outcome || 'Not yet defined'}`);
    if (packet.product.currentMethod) lines.push(`- Current method: ${packet.product.currentMethod}`);
    lines.push(`- Refinements: ${packet.product.refinements.join(', ') || 'None selected'}`);

    if (packet.sections.scope) {
      lines.push(sectionHeading('First-release scope'), bulletList(packet.sections.scope.firstReleaseFeatures));
      lines.push(sectionHeading('Critical workflow'), packet.sections.scope.criticalWorkflow.map((item, index) => `${index + 1}. ${item}`).join('\n') || '1. Not yet documented');
      lines.push(sectionHeading('Non-goals'), bulletList(packet.sections.scope.nonGoals));
    }
    if (packet.sections.decisions) lines.push(sectionHeading('Current decisions'), bulletList(packet.sections.decisions));
    if (packet.sections.risks) lines.push(sectionHeading('Risk register'), bulletList(packet.sections.risks));
    if (packet.sections.validation) {
      lines.push(sectionHeading('Open assumptions'), bulletList(packet.sections.validation.assumptions));
      lines.push(sectionHeading('Validation questions'), bulletList(packet.sections.validation.questions));
      lines.push('', `**Evidence boundary:** ${packet.sections.validation.evidenceBoundary}`);
    }
    if (packet.sections.delivery) {
      lines.push(sectionHeading('Delivery phases'), packet.sections.delivery.phases.map((item, index) => `${index + 1}. ${item}`).join('\n'));
      lines.push(sectionHeading('Review gates'), packet.sections.delivery.gates.map((gate) => `- [${gate.status === 'confirmed' ? 'x' : ' '}] ${gate.label} — ${gate.status}`).join('\n'));
    }
    if (packet.sections.evidence) {
      lines.push(sectionHeading('Evidence and publication controls'), `**Status:** ${packet.sections.evidence.status}`, '', bulletList(packet.sections.evidence.restrictions));
    }
    if (packet.sections.signoff) {
      lines.push(sectionHeading('Sign-off matrix'));
      lines.push('| Role | Responsibility | Status |\n| --- | --- | --- |');
      packet.sections.signoff.forEach((item) => lines.push(`| ${item.role} | ${item.responsibility} | ${item.status} |`));
    }
    if (packet.reviewNotes) lines.push(sectionHeading('Internal review notes'), packet.reviewNotes);
    lines.push(sectionHeading('Next decision'), packet.nextDecision, '', `> ${packet.disclaimer}`);
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function serializePacket(packet) {
    return JSON.stringify(packet, null, 2);
  }

  return {
    PACKET_VERSION,
    MODES: [...MODES],
    AUDIENCES: [...AUDIENCES],
    SECTIONS: [...SECTIONS],
    normalizeOptions,
    buildGates,
    buildReviewPacket,
    packetToMarkdown,
    serializePacket,
  };
});
