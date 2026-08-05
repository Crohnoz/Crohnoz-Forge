(() => {
  const ideaInput = document.querySelector('#idea-input');
  const audienceInput = document.querySelector('#audience-input');
  const formatInput = document.querySelector('#format-input');
  const blueprint = document.querySelector('#blueprint');
  const reviewForm = document.querySelector('.review-form');

  if (!ideaInput || !audienceInput || !formatInput || !blueprint) return;

  const profiles = [
    {
      key: 'retail',
      words: ['inventory', 'stock', 'expire', 'expiry', 'shop', 'store', 'retail', 'waste'],
      problem: 'Stock decisions are delayed because product risk, expiry, and corrective actions are not visible in one workflow.',
      value: 'Give small teams an ordered view of what needs attention, what action to take, and what outcome followed.',
      data: ['Product and batch identity', 'Expiry or risk date', 'Stock quantity and location', 'Action and outcome history'],
      integrations: ['Spreadsheet import', 'Barcode or QR capture', 'Optional point-of-sale export'],
      adoption: ['Begin with one product category', 'Import existing spreadsheet data', 'Run a daily five-minute action review'],
    },
    {
      key: 'assets',
      words: ['tool', 'construction', 'borrow', 'qr', 'equipment', 'asset', 'maintenance'],
      problem: 'Asset custody and condition become uncertain when handoffs are recorded across paper, messages, and memory.',
      value: 'Create a defensible movement history so teams know who has each asset, where it moved, and what condition was recorded.',
      data: ['Asset identity and category', 'Custodian and location', 'Issue, return, and condition events', 'Evidence attachments'],
      integrations: ['QR labels', 'Existing asset spreadsheet', 'Optional maintenance calendar'],
      adoption: ['Label a limited pilot set', 'Train one supervisor and one field crew', 'Compare missing or late returns against the baseline'],
    },
    {
      key: 'logistics',
      words: ['delivery', 'warehouse', 'logistics', 'supplier', 'damage', 'shipment', 'evidence'],
      problem: 'Operational evidence is fragmented, making exceptions slow to classify, assign, resolve, and audit.',
      value: 'Turn delivery and warehouse events into one traceable exception workflow with clear ownership and evidence.',
      data: ['Shipment or order reference', 'Event time and location', 'Exception type and severity', 'Evidence and resolution status'],
      integrations: ['CSV or API order import', 'Camera and file capture', 'Email or messaging notifications'],
      adoption: ['Pilot one exception type', 'Define response ownership before launch', 'Measure resolution time and missing evidence'],
    },
    {
      key: 'care',
      words: ['clinic', 'patient', 'appointment', 'booking', 'medical', 'care', 'older', 'elderly', 'assistance'],
      problem: 'People and service teams lose confidence when requests, availability, consent, and follow-up are difficult to coordinate.',
      value: 'Provide a guided, accessible service flow that reduces ambiguity while keeping sensitive decisions under human control.',
      data: ['Service request and preferred time', 'User and authorized contact details', 'Consent and communication preferences', 'Appointment or assistance outcome'],
      integrations: ['Calendar synchronization', 'Email or messaging reminders', 'Optional identity verification'],
      adoption: ['Test language and touch targets with real users', 'Keep registration optional during validation', 'Introduce staff workflow before automation'],
    },
  ];

  const fallbackProfile = {
    key: 'workflow',
    problem: 'A recurring need is handled through disconnected steps, unclear ownership, and limited measurement.',
    value: 'Replace the fragmented process with a guided workflow that makes responsibility, status, and outcomes visible.',
    data: ['Request or record identity', 'Responsible role', 'Status and timestamps', 'Outcome and baseline measure'],
    integrations: ['Spreadsheet import', 'Email notifications', 'Existing system export or API when justified'],
    adoption: ['Pilot with one team', 'Preserve a simple fallback process', 'Measure completion and error rates before expanding'],
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function selectedRefinements() {
    return [...document.querySelectorAll('[data-refine].selected')].map((button) => button.dataset.refine);
  }

  function chooseProfile() {
    const idea = ideaInput.value.toLowerCase();
    return profiles.find((profile) => profile.words.some((word) => idea.includes(word))) || fallbackProfile;
  }

  function ensureUI() {
    if (document.querySelector('#blueprint-strategy')) return;

    const evidence = document.querySelector('#forge-evidence');
    if (!evidence) return;

    const previewGrid = evidence.querySelector('.preview-validation-grid');
    if (!previewGrid) return;

    previewGrid.insertAdjacentHTML('afterend', `
      <section class="blueprint-strategy" id="blueprint-strategy" aria-labelledby="strategy-title">
        <div class="strategy-heading">
          <div>
            <p class="eyebrow">PRODUCT STRATEGY LAYER</p>
            <h3 id="strategy-title">Define what should be built—and what should not.</h3>
          </div>
          <span class="strategy-disclaimer">Exploratory · human validation required</span>
        </div>

        <div class="strategy-grid">
          <article class="strategy-card strategy-card-primary">
            <span class="strategy-index">06</span>
            <p class="eyebrow">PROBLEM INTERPRETATION</p>
            <h4 id="strategy-problem"></h4>
            <div class="strategy-value">
              <small>Suggested value proposition</small>
              <strong id="strategy-value"></strong>
            </div>
          </article>

          <article class="strategy-card">
            <span class="strategy-index">07</span>
            <p class="eyebrow">MVP BOUNDARY</p>
            <div class="scope-columns">
              <div><small>First release</small><ul id="strategy-scope"></ul></div>
              <div><small>Not in the first release</small><ul id="strategy-out"></ul></div>
            </div>
          </article>

          <article class="strategy-card">
            <span class="strategy-index">08</span>
            <p class="eyebrow">DATA & INTEGRATIONS</p>
            <div class="scope-columns">
              <div><small>Minimum data</small><ul id="strategy-data"></ul></div>
              <div><small>Likely connections</small><ul id="strategy-integrations"></ul></div>
            </div>
          </article>

          <article class="strategy-card">
            <span class="strategy-index">09</span>
            <p class="eyebrow">RISK REGISTER</p>
            <div class="risk-list" id="strategy-risks"></div>
          </article>

          <article class="strategy-card">
            <span class="strategy-index">10</span>
            <p class="eyebrow">ADOPTION CONSIDERATIONS</p>
            <ul id="strategy-adoption"></ul>
          </article>

          <article class="strategy-card strategy-card-wide">
            <span class="strategy-index">11</span>
            <p class="eyebrow">SUGGESTED DELIVERY PHASES</p>
            <div class="delivery-phases" id="strategy-phases"></div>
          </article>
        </div>
      </section>
    `);
  }

  function scopeFor(profile, refinements) {
    const base = [
      `One critical ${profile.key === 'workflow' ? 'request' : profile.key} workflow from capture to outcome`,
      'A focused operational view for the primary responsible role',
      'Basic status history and measurable completion events',
      'Manual administration controls for the pilot',
    ];

    if (refinements.includes('mobile')) base.push('Mobile-first capture for the critical field action');
    if (refinements.includes('qr')) base.push('QR identity and scan history for relevant records');
    if (refinements.includes('ai')) base.push('Explainable suggestions with explicit human approval');
    if (refinements.includes('saas')) base.push('Organization isolation and a reusable configuration model');
    if (refinements.includes('simpler')) return base.slice(0, 3);
    return base.slice(0, 6);
  }

  function outOfScopeFor(refinements) {
    const items = [
      'Full migration of every historic record',
      'Complex custom reporting before baseline metrics exist',
      'Automating decisions that have not been validated manually',
      'Native applications for every platform during the first pilot',
    ];

    if (!refinements.includes('ai')) items.push('Predictive or generative AI automation');
    if (!refinements.includes('saas')) items.push('Subscription billing and self-service tenant provisioning');
    if (!refinements.includes('qr')) items.push('Large-scale QR label rollout');
    return items.slice(0, 5);
  }

  function integrationsFor(profile, refinements) {
    const integrations = [...profile.integrations];
    const method = document.querySelector('#current-method-input')?.value || '';

    if (method.includes('spreadsheets')) integrations.unshift('Controlled spreadsheet import');
    if (refinements.includes('qr')) integrations.push('Device camera and QR scanner');
    if (refinements.includes('ai')) integrations.push('Server-side AI service with cost and abuse controls');
    if (refinements.includes('saas')) integrations.push('Authentication and organization management');
    return [...new Set(integrations)].slice(0, 5);
  }

  function risksFor(profile, refinements) {
    const technical = formatInput.value === 'hardware-connected product'
      ? 'Connectivity, device maintenance, and field reliability must be tested in the real operating environment.'
      : 'Existing data quality and integration constraints may change the implementation effort.';

    const adoption = refinements.includes('simpler')
      ? 'The reduced scope must still solve the critical job well enough to replace the current habit.'
      : 'Users may continue using familiar spreadsheets or messages unless ownership and training are explicit.';

    let regulatory = 'Privacy, intellectual-property terms, retention, and publication consent require explicit product rules.';
    if (profile.key === 'care') regulatory = 'Sensitive personal or health-related information requires stricter consent, access control, retention, and legal review.';
    if (refinements.includes('ai')) regulatory += ' AI suggestions require transparency, review controls, and safe handling of submitted information.';

    return [
      ['Technical', technical, formatInput.value === 'hardware-connected product' ? 'Higher' : 'Moderate'],
      ['Adoption', adoption, audienceInput.value === 'consumers' ? 'Higher' : 'Moderate'],
      ['Privacy / regulatory', regulatory, profile.key === 'care' || refinements.includes('ai') ? 'Higher' : 'Moderate'],
    ];
  }

  function deliveryPhases(profile, refinements) {
    const prototypeFocus = refinements.includes('mobile') ? 'mobile critical flow' : `${profile.key} critical flow`;
    return [
      ['01', 'Discovery', 'Validate users, baseline, ownership, constraints, and the measurable success signal.'],
      ['02', 'Prototype', `Test the ${prototypeFocus} with representative users before committing to production scope.`],
      ['03', 'Pilot MVP', 'Launch one bounded workflow, instrument outcomes, and keep human fallback controls.'],
      ['04', 'Scale decision', 'Expand, integrate, productize, or stop based on evidence—not presentation quality alone.'],
    ];
  }

  function renderList(selector, items) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderStrategy() {
    ensureUI();
    const section = document.querySelector('#blueprint-strategy');
    if (!section || blueprint.hidden) return;

    const profile = chooseProfile();
    const refinements = selectedRefinements();
    const goal = document.querySelector('#goal-input')?.value || 'improve the current workflow';

    document.querySelector('#strategy-problem').textContent = profile.problem;
    document.querySelector('#strategy-value').textContent = `${profile.value} The current direction prioritizes the outcome “${goal}”.`;

    renderList('#strategy-scope', scopeFor(profile, refinements));
    renderList('#strategy-out', outOfScopeFor(refinements));
    renderList('#strategy-data', profile.data);
    renderList('#strategy-integrations', integrationsFor(profile, refinements));
    renderList('#strategy-adoption', profile.adoption);

    document.querySelector('#strategy-risks').innerHTML = risksFor(profile, refinements).map(([label, description, level]) => `
      <div class="risk-item">
        <div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(level)}</span></div>
        <p>${escapeHtml(description)}</p>
      </div>
    `).join('');

    document.querySelector('#strategy-phases').innerHTML = deliveryPhases(profile, refinements).map(([number, title, description]) => `
      <div class="delivery-phase">
        <span>${escapeHtml(number)}</span>
        <div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>
      </div>
    `).join('');
  }

  function strategyReviewSummary() {
    const profile = chooseProfile();
    const refinements = selectedRefinements();
    const scope = scopeFor(profile, refinements);
    const risks = risksFor(profile, refinements);

    return [
      'Strategic blueprint',
      `Problem interpretation: ${profile.problem}`,
      `Suggested value proposition: ${profile.value}`,
      `MVP boundary: ${scope.join('; ')}`,
      `Primary risks: ${risks.map(([label, description]) => `${label}: ${description}`).join(' | ')}`,
      'Requested human validation: confirm scope, data availability, adoption ownership, regulatory obligations, and delivery phases.',
    ].join('\n\n');
  }

  function wireEvents() {
    ideaInput.addEventListener('input', renderStrategy);
    audienceInput.addEventListener('change', renderStrategy);
    formatInput.addEventListener('change', renderStrategy);
    document.querySelector('#goal-input')?.addEventListener('change', renderStrategy);
    document.querySelector('#current-method-input')?.addEventListener('change', renderStrategy);

    document.querySelectorAll('[data-refine]').forEach((button) => {
      button.addEventListener('click', () => window.setTimeout(renderStrategy, 0));
    });

    document.querySelector('#copy-to-review')?.addEventListener('click', () => {
      const textarea = reviewForm?.querySelector('textarea[name="review-request"]');
      if (!textarea) return;
      textarea.value = `${textarea.value}\n\n${strategyReviewSummary()}`.trim();
    });
  }

  ensureUI();
  wireEvents();

  const observer = new MutationObserver(() => {
    if (!blueprint.hidden) renderStrategy();
  });
  observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
})();