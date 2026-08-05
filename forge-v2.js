(() => {
  const ideaInput = document.querySelector('#idea-input');
  const audienceInput = document.querySelector('#audience-input');
  const formatInput = document.querySelector('#format-input');
  const blueprint = document.querySelector('#blueprint');
  const reviewForm = document.querySelector('.review-form');

  if (!ideaInput || !audienceInput || !formatInput || !blueprint) return;

  const enhancementState = {
    activePreview: 'overview',
    version: 0,
    lastSignature: '',
  };

  const profiles = [
    {
      words: ['inventory', 'stock', 'expire', 'expiry', 'shop', 'store', 'retail', 'waste'],
      name: 'ShelfSignal',
      category: 'Retail operations',
      workflow: ['Capture stock', 'Detect risk', 'Recommend action', 'Track outcome'],
      preview: { metric: '18 items', label: 'need attention', action: 'Review expiry queue', items: ['Yogurt batch · 2 days', 'Fresh juice · 3 days', 'Prepared meals · 4 days'] },
    },
    {
      words: ['tool', 'construction', 'borrow', 'qr', 'equipment', 'asset'],
      name: 'ToolChain',
      category: 'Asset traceability',
      workflow: ['Register asset', 'Assign custody', 'Record movement', 'Close return'],
      preview: { metric: '42 assets', label: 'currently assigned', action: 'Scan an asset', items: ['Impact drill · Site A', 'Laser level · Crew 04', 'Generator · Maintenance due'] },
    },
    {
      words: ['older', 'elderly', 'assistance', 'community', 'trusted', 'care'],
      name: 'NeighbourLink',
      category: 'Trusted assistance',
      workflow: ['Request help', 'Match support', 'Confirm trust', 'Follow outcome'],
      preview: { metric: '3 helpers', label: 'available nearby', action: 'Request assistance', items: ['Pharmacy pickup', 'Home technology help', 'Accompanied appointment'] },
    },
    {
      words: ['delivery', 'warehouse', 'logistics', 'supplier', 'damage', 'trace', 'shipment'],
      name: 'ProofFlow',
      category: 'Logistics evidence',
      workflow: ['Capture event', 'Classify issue', 'Notify owner', 'Resolve and audit'],
      preview: { metric: '7 exceptions', label: 'require review', action: 'Capture delivery evidence', items: ['Damaged box · Dock 03', 'Missing signature · Route 12', 'Supplier response pending'] },
    },
    {
      words: ['appointment', 'clinic', 'patient', 'booking', 'schedule', 'medical'],
      name: 'CareRoute',
      category: 'Service coordination',
      workflow: ['Request service', 'Confirm availability', 'Deliver appointment', 'Follow up'],
      preview: { metric: '12 visits', label: 'scheduled today', action: 'Create appointment', items: ['09:30 · Initial visit', '11:00 · Follow-up', '15:30 · Priority slot'] },
    },
  ];

  const fallbackProfile = {
    name: 'ForgeFlow',
    category: 'Custom workflow',
    workflow: ['Capture need', 'Prioritize', 'Take action', 'Review result'],
    preview: { metric: '8 actions', label: 'need attention', action: 'Start a new request', items: ['New request awaiting review', 'Priority action assigned', 'Outcome ready to verify'] },
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

  function scores() {
    const idea = ideaInput.value.trim();
    const concrete = /\b(today|currently|manual|spreadsheet|whatsapp|hours|minutes|users|employees|customers|per month|each week|error|cost)\b/i.test(idea);
    const refinements = selectedRefinements();
    return {
      clarity: Math.min(94, 48 + Math.round(idea.length / 18) + (concrete ? 12 : 0)),
      feasibility: Math.min(93, (formatInput.value === 'hardware-connected product' ? 62 : 76) + (refinements.includes('simpler') ? 10 : 0) - (refinements.includes('ai') ? 7 : 0)),
      data: Math.min(88, 38 + (concrete ? 24 : 0) + (idea.length > 180 ? 12 : 0)),
      reuse: Math.min(91, 55 + (audienceInput.value === 'small businesses' ? 18 : 8) + (refinements.includes('saas') ? 12 : 0)),
    };
  }

  function ensureUI() {
    const contextGrid = document.querySelector('.context-grid');
    if (contextGrid && !document.querySelector('#goal-input')) {
      contextGrid.insertAdjacentHTML('afterend', `
        <div class="discovery-strip" aria-label="Idea discovery context">
          <label>Primary outcome
            <select id="goal-input">
              <option value="save operational time">Save operational time</option>
              <option value="reduce errors and uncertainty">Reduce errors</option>
              <option value="increase sales or conversion">Increase sales</option>
              <option value="improve user access and experience">Improve access</option>
              <option value="validate a startup opportunity">Validate a startup</option>
            </select>
          </label>
          <label>Current method
            <select id="current-method-input">
              <option value="spreadsheets and messages">Spreadsheets and messages</option>
              <option value="paper or manual records">Paper or manual records</option>
              <option value="an existing system with gaps">Existing system with gaps</option>
              <option value="no current solution">No current solution</option>
              <option value="still unknown">Still unknown</option>
            </select>
          </label>
        </div>
      `);
    }

    const blueprintGrid = document.querySelector('.blueprint-grid-layout');
    if (blueprintGrid && !document.querySelector('#forge-evidence')) {
      blueprintGrid.insertAdjacentHTML('afterend', `
        <section class="forge-evidence" id="forge-evidence" aria-label="Blueprint evidence and preview">
          <div class="score-strip" id="score-strip" aria-label="Exploratory readiness indicators"></div>
          <div class="preview-validation-grid">
            <article class="product-preview" aria-labelledby="product-preview-title">
              <div class="preview-heading">
                <div><p class="eyebrow">INTERACTIVE PREVIEW</p><h3 id="product-preview-title">See the product direction</h3></div>
                <span id="blueprint-version" class="version-chip">Blueprint v1</span>
              </div>
              <div class="preview-tabs" role="tablist" aria-label="Preview screens">
                <button type="button" role="tab" aria-selected="true" data-preview="overview">Overview</button>
                <button type="button" role="tab" aria-selected="false" data-preview="capture">Capture</button>
                <button type="button" role="tab" aria-selected="false" data-preview="insights">Insights</button>
              </div>
              <div class="preview-device" id="preview-device" aria-live="polite"></div>
            </article>
            <article class="validation-plan" aria-labelledby="validation-title">
              <p class="eyebrow">VALIDATE BEFORE BUILDING</p>
              <h3 id="validation-title">What the Forge would test next</h3>
              <ol id="validation-questions"></ol>
              <div class="validation-callout"><small>Recommended first experiment</small><strong id="validation-experiment"></strong></div>
              <div class="validation-callout muted-callout"><small>Early success signal</small><strong id="validation-signal"></strong></div>
            </article>
          </div>
          <div class="blueprint-actions">
            <button class="button button-secondary" id="copy-to-review" type="button">Send blueprint to review</button>
            <button class="button button-ghost" id="new-angle" type="button">Generate another angle</button>
            <span id="blueprint-action-status" role="status" aria-live="polite"></span>
          </div>
        </section>
      `);
    }

    const sliderPanel = document.querySelector('.slider-panel');
    if (sliderPanel && !document.querySelector('#hourly-value-slider')) {
      const note = sliderPanel.querySelector('.form-note');
      note.insertAdjacentHTML('beforebegin', `
        <label><span>Value per working hour <strong id="hourly-value">CLP 10,000</strong></span>
          <input id="hourly-value-slider" type="range" min="3000" max="50000" step="1000" value="10000" />
        </label>
      `);
      document.querySelector('.metrics-panel').insertAdjacentHTML('beforeend', `
        <article class="value-metric"><small>Annual capacity value</small><strong id="annual-value">CLP 6.7M</strong><span>scenario, not guaranteed savings</span></article>
      `);
    }

    const storyGrid = document.querySelector('.story-grid');
    if (storyGrid && !document.querySelector('#story-evidence-note')) {
      storyGrid.insertAdjacentHTML('beforebegin', `
        <div class="story-filter-row" id="story-evidence-note">
          <span>Outcome evidence:</span>
          <button type="button" class="active" data-story-filter="all">All stories</button>
          <button type="button" data-story-filter="operations">Operations</button>
          <button type="button" data-story-filter="retail">Retail</button>
          <button type="button" data-story-filter="accessibility">Accessibility</button>
        </div>
      `);
      [...storyGrid.querySelectorAll('.story-card')].forEach((card) => {
        card.dataset.storyCategory = card.querySelector('.story-topline span:last-child')?.textContent.toLowerCase() || 'other';
        card.insertAdjacentHTML('beforeend', '<span class="evidence-badge">Fictional demonstration</span>');
      });
    }
  }

  function renderScores() {
    const values = scores();
    const definitions = [
      ['Problem clarity', values.clarity, 'How clearly the problem and intended user are described.'],
      ['MVP feasibility', values.feasibility, 'How practical a focused first release appears.'],
      ['Data readiness', values.data, 'How much measurable context is currently available.'],
      ['Reuse potential', values.reuse, 'How likely the core workflow could serve similar organizations.'],
    ];
    document.querySelector('#score-strip').innerHTML = definitions.map(([label, value, description]) => `
      <article title="${escapeHtml(description)}">
        <div><span>${escapeHtml(label)}</span><strong>${value}%</strong></div>
        <div class="score-track"><span style="width:${value}%"></span></div>
        <small>${escapeHtml(description)}</small>
      </article>
    `).join('');
  }

  function renderPreview() {
    const profile = chooseProfile();
    const goal = document.querySelector('#goal-input')?.value || 'improve the workflow';
    const method = document.querySelector('#current-method-input')?.value || 'the current process';
    const screens = {
      overview: `
        <div class="mock-topbar"><span>${escapeHtml(profile.name)}</span><span class="mock-avatar">CF</span></div>
        <div class="mock-hero-metric"><small>${escapeHtml(profile.preview.label)}</small><strong>${escapeHtml(profile.preview.metric)}</strong><button type="button">${escapeHtml(profile.preview.action)}</button></div>
        <div class="mock-list">${profile.preview.items.map((item, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item)}</strong><em>${index === 0 ? 'Priority' : 'Open'}</em></div>`).join('')}</div>
      `,
      capture: `
        <div class="mock-topbar"><span>New record</span><span>Step 1 of 3</span></div>
        <div class="mock-form">
          <label>What happened?<span>${escapeHtml(profile.workflow[0])}</span></label>
          <label>Who is responsible?<span>Select a person or team</span></label>
          <label>Add evidence<span>Photo, note, file, or reference</span></label>
          <button type="button">Save and continue</button>
        </div>
      `,
      insights: `
        <div class="mock-topbar"><span>Opportunity view</span><span>Exploratory</span></div>
        <div class="mock-insight"><small>Primary outcome</small><strong>${escapeHtml(goal)}</strong></div>
        <div class="mock-bars"><div><span>Current friction</span><i style="width:82%"></i></div><div><span>Workflow clarity</span><i style="width:68%"></i></div><div><span>Measurability</span><i style="width:56%"></i></div></div>
        <p>Replace ${escapeHtml(method)} with one accountable, measurable workflow.</p>
      `,
    };
    document.querySelector('#preview-device').innerHTML = screens[enhancementState.activePreview];
    document.querySelectorAll('[data-preview]').forEach((button) => {
      const active = button.dataset.preview === enhancementState.activePreview;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function renderValidation() {
    const profile = chooseProfile();
    const refinements = selectedRefinements();
    const questions = [
      `How frequently does the ${profile.category.toLowerCase()} problem occur today?`,
      formatInput.value === 'hardware-connected product' ? 'Where will the hardware operate, and what connectivity or maintenance constraints exist?' : 'Which role feels the cost or frustration most directly?',
      refinements.includes('ai') ? 'Which decisions may AI suggest, and which must always remain under human control?' : 'What measurable result would prove that the first release is useful?',
    ];
    document.querySelector('#validation-questions').innerHTML = questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('');
    document.querySelector('#validation-experiment').textContent = `Run a five-user workflow test around “${profile.workflow[0]} → ${profile.workflow[1]}” before expanding scope.`;
    document.querySelector('#validation-signal').textContent = 'Users complete the critical workflow with less friction and produce a result measurable against the current process.';
  }

  function renderEnhancements(forceVersion = false) {
    if (blueprint.hidden) return;
    const signature = [ideaInput.value, audienceInput.value, formatInput.value, selectedRefinements().join(','), document.querySelector('#goal-input')?.value, document.querySelector('#current-method-input')?.value].join('|');
    if (forceVersion || signature !== enhancementState.lastSignature) enhancementState.version += 1;
    enhancementState.lastSignature = signature;
    document.querySelector('#blueprint-version').textContent = `Blueprint v${Math.max(1, enhancementState.version)}`;
    renderScores();
    renderPreview();
    renderValidation();
  }

  function formatCompactCLP(value) {
    if (value >= 1000000) return `CLP ${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    if (value >= 1000) return `CLP ${Math.round(value / 1000)}K`;
    return `CLP ${Math.round(value).toLocaleString('es-CL')}`;
  }

  function updateValueMetric() {
    const operations = Number(document.querySelector('#operations-slider').value);
    const minutes = Number(document.querySelector('#minutes-slider').value);
    const reduction = Number(document.querySelector('#reduction-slider').value);
    const hourlyValue = Number(document.querySelector('#hourly-value-slider').value);
    const savedHours = operations * minutes / 60 * reduction / 100;
    document.querySelector('#hourly-value').textContent = `CLP ${hourlyValue.toLocaleString('es-CL')}`;
    document.querySelector('#annual-value').textContent = formatCompactCLP(savedHours * 12 * hourlyValue);
  }

  function reviewSummary() {
    const profile = chooseProfile();
    const values = scores();
    return [
      `Forge Blueprint: ${profile.name}`,
      `Original idea: ${ideaInput.value.trim()}`,
      `Audience: ${audienceInput.value}`,
      `Format: ${formatInput.value}`,
      `Primary outcome: ${document.querySelector('#goal-input')?.value}`,
      `Current method: ${document.querySelector('#current-method-input')?.value}`,
      `Refinements: ${selectedRefinements().join(', ') || 'none yet'}`,
      `Exploratory indicators: clarity ${values.clarity}%, feasibility ${values.feasibility}%, data readiness ${values.data}%, reuse potential ${values.reuse}%`,
      'Please review feasibility, scope, risks, and the best first prototype.',
    ].join('\n\n');
  }

  function wireEvents() {
    document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => {
      enhancementState.activePreview = button.dataset.preview;
      renderPreview();
    }));

    document.querySelectorAll('[data-refine]').forEach((button) => button.addEventListener('click', () => window.setTimeout(() => renderEnhancements(true), 0)));
    audienceInput.addEventListener('change', () => renderEnhancements(true));
    formatInput.addEventListener('change', () => renderEnhancements(true));
    document.querySelector('#goal-input').addEventListener('change', () => renderEnhancements(true));
    document.querySelector('#current-method-input').addEventListener('change', () => renderEnhancements(true));

    document.querySelector('#copy-to-review').addEventListener('click', () => {
      const reviewTextarea = reviewForm?.querySelector('textarea[name="review-request"]');
      if (!reviewTextarea) return;
      reviewTextarea.value = reviewSummary();
      document.querySelector('#blueprint-action-status').textContent = 'Blueprint added to the private review request.';
      reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => reviewTextarea.focus(), 450);
    });

    document.querySelector('#new-angle').addEventListener('click', () => {
      const next = ['simpler', 'mobile', 'saas'].find((key) => !selectedRefinements().includes(key)) || 'simpler';
      document.querySelector(`[data-refine="${next}"]`)?.click();
      document.querySelector('#blueprint-action-status').textContent = 'A different product angle has been applied.';
    });

    document.querySelector('#hourly-value-slider').addEventListener('input', updateValueMetric);
    ['operations-slider', 'minutes-slider', 'reduction-slider'].forEach((id) => document.querySelector(`#${id}`).addEventListener('input', updateValueMetric));

    document.querySelectorAll('[data-story-filter]').forEach((button) => button.addEventListener('click', () => {
      const filter = button.dataset.storyFilter;
      document.querySelectorAll('[data-story-filter]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
      document.querySelectorAll('.story-card').forEach((card) => { card.hidden = filter !== 'all' && card.dataset.storyCategory !== filter; });
    }));
  }

  ensureUI();
  wireEvents();
  updateValueMetric();

  const observer = new MutationObserver(() => {
    if (!blueprint.hidden) renderEnhancements(true);
  });
  observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
})();
