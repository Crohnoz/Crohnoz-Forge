(() => {
  const blueprint = document.querySelector('#blueprint');
  const refineActions = document.querySelector('#refine-actions');
  const audienceInput = document.querySelector('#audience-input');
  const formatInput = document.querySelector('#format-input');

  if (!blueprint || !refineActions || !audienceInput || !formatInput) return;

  const visualDirections = [
    { key: 'precision-grid', label: 'Precision grid', note: 'Dense operational hierarchy, technical grid, compact controls.' },
    { key: 'warm-service', label: 'Warm service', note: 'Softer hierarchy, guided actions, reassuring service cues.' },
    { key: 'field-utility', label: 'Field utility', note: 'Large touch targets, high contrast, fast scanning, offline-minded flow.' },
  ];

  let visualDirectionIndex = 0;

  const refinements = {
    simpler: {
      title: 'Focused MVP',
      summary: 'Reduce the first release to one critical workflow and the minimum supporting roles.',
      feature: 'Single critical path with progressive disclosure',
      assumption: 'Secondary workflows can wait without blocking the first measurable outcome.',
      preview: 'One primary action',
    },
    mobile: {
      title: 'Mobile-first operation',
      summary: 'Prioritize touch interaction, short capture steps, constrained bandwidth, and field context.',
      feature: 'Mobile-first task flow with resilient drafts',
      assumption: 'Primary users can complete the workflow on a small screen.',
      preview: 'Mobile task mode',
    },
    qr: {
      title: 'QR traceability',
      summary: 'Give assets, batches, locations, or cases a scannable identity and movement history.',
      feature: 'QR identity, scan event, and custody timeline',
      assumption: 'Labels can be maintained and scans happen at meaningful process points.',
      preview: 'Scan and trace',
    },
    ai: {
      title: 'Human-controlled AI',
      summary: 'Add explainable recommendations while preserving human approval and auditability.',
      feature: 'Explainable suggestion queue with approval controls',
      assumption: 'Suitable data, consent, and evaluation criteria exist for AI-supported decisions.',
      preview: 'AI suggestion review',
    },
    saas: {
      title: 'SaaS product model',
      summary: 'Shape a reusable core, subscription boundaries, tenant settings, and platform operations.',
      feature: 'Reusable SaaS workspace and subscription readiness',
      assumption: 'Several organizations share a sufficiently similar core process.',
      preview: 'Workspace switcher',
    },
    payments: {
      title: 'Payments',
      summary: 'Introduce quotes, payment state, receipts, reversals, and reconciliation boundaries.',
      feature: 'Payment status, receipt, and reconciliation workflow',
      assumption: 'The payment provider, refund policy, taxes, and financial responsibilities require validation.',
      preview: 'Payment status',
    },
    'no-registration': {
      title: 'Low-friction access',
      summary: 'Let users begin the critical flow without mandatory account creation, while protecting sensitive actions.',
      feature: 'Guest entry with optional verified continuation',
      assumption: 'Anonymous access is appropriate only for low-risk actions and limited data.',
      preview: 'Continue as guest',
    },
    inventory: {
      title: 'Inventory operations',
      summary: 'Add stock identity, locations, quantities, batches, movements, and exception handling.',
      feature: 'Inventory movement and exception ledger',
      assumption: 'Stock units, ownership, locations, and reconciliation rules are clearly defined.',
      preview: 'Inventory queue',
    },
    dashboards: {
      title: 'Decision dashboards',
      summary: 'Expose role-specific metrics, exceptions, trends, and drill-down paths instead of decorative charts.',
      feature: 'Role-based dashboard with actionable drill-down',
      assumption: 'Metrics have owners, definitions, baselines, and action thresholds.',
      preview: 'Decision dashboard',
    },
    'multi-org': {
      title: 'Multi-organization support',
      summary: 'Separate organizations, users, records, settings, and audit history with explicit tenant boundaries.',
      feature: 'Organization isolation, scoped roles, and tenant settings',
      assumption: 'Tenant isolation and cross-organization reporting rules require security review.',
      preview: 'Organization context',
    },
    accessible: {
      title: 'Accessibility-first',
      summary: 'Make keyboard, contrast, motion, labels, touch targets, and cognitive load first-class product requirements.',
      feature: 'Accessible interaction baseline and guided error recovery',
      assumption: 'Representative accessibility testing is included before release.',
      preview: 'Accessible mode',
    },
    'visual-alt': {
      title: 'Alternative visual direction',
      summary: 'Change the interface character without changing the product purpose or information architecture.',
      feature: 'Validated visual direction with reusable design tokens',
      assumption: 'Visual preference must not reduce clarity, accessibility, or task speed.',
      preview: 'Visual direction',
    },
  };

  const extraControls = [
    ['payments', 'Include payments'],
    ['no-registration', 'Remove mandatory registration'],
    ['inventory', 'Add inventory'],
    ['dashboards', 'Add dashboards'],
    ['multi-org', 'Multi-organization'],
    ['accessible', 'Accessibility-first'],
    ['visual-alt', 'Change visual direction'],
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function selectedKeys() {
    return [...document.querySelectorAll('[data-refine].selected')]
      .map((button) => button.dataset.refine)
      .filter((key) => refinements[key]);
  }

  function ensureControls() {
    if (document.querySelector('#extended-refine-actions')) return;

    refineActions.insertAdjacentHTML('afterend', `
      <div class="extended-refine-group" id="extended-refine-actions" aria-label="Additional product refinements">
        <span>Product capabilities</span>
        <div>
          ${extraControls.map(([key, label]) => `
            <button type="button" data-refine="${key}" data-extended-refinement="true" aria-pressed="false">${escapeHtml(label)}</button>
          `).join('')}
        </div>
      </div>
    `);

    blueprint.insertAdjacentHTML('beforeend', `
      <section class="refinement-impact" id="refinement-impact" hidden aria-labelledby="refinement-impact-title">
        <div class="refinement-impact-header">
          <div>
            <p class="eyebrow">VISIBLE REFINEMENT IMPACT</p>
            <h3 id="refinement-impact-title">How the product direction changed</h3>
          </div>
          <span id="refinement-impact-count">0 active</span>
        </div>
        <div class="refinement-impact-grid" id="refinement-impact-grid"></div>
        <div class="visual-direction-summary" id="visual-direction-summary" hidden></div>
      </section>
    `);
  }

  function clearGeneratedListItems() {
    document.querySelectorAll('[data-refinement-generated]').forEach((item) => item.remove());
    document.querySelectorAll('[data-refinement-tag]').forEach((tag) => tag.remove());
  }

  function appendBlueprintEffects(keys) {
    clearGeneratedListItems();
    const featureList = document.querySelector('#feature-list');
    const assumptionList = document.querySelector('#assumption-list');
    const tagRow = document.querySelector('#product-tags');

    keys.forEach((key) => {
      const definition = refinements[key];
      featureList?.insertAdjacentHTML('beforeend', `<li data-refinement-generated="${key}">${escapeHtml(definition.feature)}</li>`);
      assumptionList?.insertAdjacentHTML('beforeend', `<li data-refinement-generated="${key}">${escapeHtml(definition.assumption)}</li>`);
      tagRow?.insertAdjacentHTML('beforeend', `<span data-refinement-tag="${key}">${escapeHtml(definition.preview)}</span>`);
    });
  }

  function renderImpact(keys) {
    const impact = document.querySelector('#refinement-impact');
    const grid = document.querySelector('#refinement-impact-grid');
    const count = document.querySelector('#refinement-impact-count');
    const directionSummary = document.querySelector('#visual-direction-summary');

    if (!impact || !grid || !count || !directionSummary) return;

    impact.hidden = keys.length === 0;
    count.textContent = `${keys.length} active`;
    grid.innerHTML = keys.map((key, index) => {
      const definition = refinements[key];
      return `
        <article data-refinement-impact="${key}">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <div>
            <h4>${escapeHtml(definition.title)}</h4>
            <p>${escapeHtml(definition.summary)}</p>
          </div>
        </article>
      `;
    }).join('');

    const visualActive = keys.includes('visual-alt');
    directionSummary.hidden = !visualActive;
    if (visualActive) {
      const direction = visualDirections[visualDirectionIndex];
      directionSummary.innerHTML = `
        <span>Selected visual direction</span>
        <strong>${escapeHtml(direction.label)}</strong>
        <p>${escapeHtml(direction.note)}</p>
      `;
    }
  }

  function renderPreviewEffects(keys) {
    const preview = document.querySelector('#preview-device');
    if (!preview) return;

    preview.querySelector('.refinement-preview-strip')?.remove();
    preview.classList.remove(...visualDirections.map((direction) => `preview-direction-${direction.key}`));

    if (keys.includes('visual-alt')) {
      preview.classList.add(`preview-direction-${visualDirections[visualDirectionIndex].key}`);
    }

    if (!keys.length) return;

    preview.insertAdjacentHTML('beforeend', `
      <div class="refinement-preview-strip" aria-label="Applied preview refinements">
        <small>Applied product direction</small>
        <div>${keys.map((key) => `<span>${escapeHtml(refinements[key].preview)}</span>`).join('')}</div>
      </div>
    `);
  }

  function renderValidationEffect(keys) {
    const validationList = document.querySelector('#validation-questions');
    if (!validationList) return;
    validationList.querySelector('[data-refinement-validation]')?.remove();
    if (!keys.length) return;

    const priority = keys.includes('payments')
      ? 'Which payment failures, reversals, and reconciliation cases must the MVP handle?'
      : keys.includes('multi-org')
        ? 'Which records and reports may cross organization boundaries, if any?'
        : keys.includes('no-registration')
          ? 'Which actions are safe without identity verification, and when must verification begin?'
          : keys.includes('accessible')
            ? 'Which users and assistive technologies must participate in accessibility testing?'
            : `Which evidence would prove that “${refinements[keys[0]].title}” improves the critical workflow?`;

    validationList.insertAdjacentHTML('beforeend', `<li data-refinement-validation="true">${escapeHtml(priority)}</li>`);
  }

  function renderAll() {
    const keys = selectedKeys();
    document.querySelectorAll('[data-refine]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
    });

    appendBlueprintEffects(keys);
    renderImpact(keys);
    renderPreviewEffects(keys);
    renderValidationEffect(keys);
    blueprint.classList.toggle('accessibility-emphasis', keys.includes('accessible'));

    window.dispatchEvent(new CustomEvent('forge:refinement-change', {
      detail: {
        refinements: keys,
        visualDirection: keys.includes('visual-alt') ? visualDirections[visualDirectionIndex].key : null,
      },
    }));
  }

  function queueRender() {
    window.setTimeout(renderAll, 0);
    window.setTimeout(renderAll, 80);
  }

  function triggerExistingRenderers() {
    audienceInput.dispatchEvent(new Event('change', { bubbles: true }));
    formatInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function handleRefinementClick(button) {
    const key = button.dataset.refine;
    if (!refinements[key]) return;

    if (button.dataset.extendedRefinement === 'true') {
      if (key === 'visual-alt') {
        const wasSelected = button.classList.contains('selected');
        if (wasSelected) visualDirectionIndex = (visualDirectionIndex + 1) % visualDirections.length;
        button.classList.add('selected');
      } else {
        button.classList.toggle('selected');
      }
      triggerExistingRenderers();
    }

    queueRender();
  }

  ensureControls();

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-refine]');
    if (button) handleRefinementClick(button);

    if (event.target.closest('#new-angle')) {
      const visualButton = document.querySelector('[data-refine="visual-alt"]');
      if (visualButton) {
        visualDirectionIndex = (visualDirectionIndex + 1) % visualDirections.length;
        visualButton.classList.add('selected');
        triggerExistingRenderers();
        queueRender();
      }
    }
  });

  const observer = new MutationObserver(() => {
    if (!blueprint.hidden) queueRender();
  });
  observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });

  queueRender();
})();
