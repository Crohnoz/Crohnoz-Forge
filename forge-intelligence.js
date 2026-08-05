(() => {
  const section = document.querySelector('#intelligence');
  const simulator = section?.querySelector('.simulator');
  const core = window.ForgeIntelligenceCore;

  if (!section || !simulator || !core) return;

  const presets = {
    retail: {
      label: 'Retail inventory',
      operations: 4200,
      minutes: 7,
      reduction: 32,
      hourlyValue: 8500,
      users: 14,
      branches: 3,
      errorRate: 7,
      reworkRate: 11,
      growthRate: 3,
      softwareCost: 90000,
      handoffs: 4,
      spreadsheets: 6,
      systems: 3,
    },
    logistics: {
      label: 'Warehouse logistics',
      operations: 18000,
      minutes: 11,
      reduction: 38,
      hourlyValue: 12000,
      users: 68,
      branches: 8,
      errorRate: 9,
      reworkRate: 16,
      growthRate: 5,
      softwareCost: 420000,
      handoffs: 7,
      spreadsheets: 9,
      systems: 6,
    },
    clinic: {
      label: 'Clinic scheduling',
      operations: 2600,
      minutes: 9,
      reduction: 28,
      hourlyValue: 15000,
      users: 22,
      branches: 2,
      errorRate: 5,
      reworkRate: 8,
      growthRate: 2,
      softwareCost: 160000,
      handoffs: 5,
      spreadsheets: 4,
      systems: 4,
    },
  };

  const defaults = {
    operations: 1200,
    minutes: 8,
    reduction: 35,
    hourlyValue: 10000,
    users: 8,
    branches: 1,
    errorRate: 6,
    reworkRate: 10,
    growthRate: 2,
    softwareCost: 60000,
    handoffs: 3,
    spreadsheets: 4,
    systems: 2,
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function formatInteger(value) {
    return Math.round(value).toLocaleString('es-CL');
  }

  function formatDecimal(value, digits = 1) {
    return Number(value).toLocaleString('es-CL', { maximumFractionDigits: digits });
  }

  function formatCLP(value) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function rangeControl({ id, label, min, max, step, value, suffix = '', prefix = '' }) {
    return `
      <label class="intelligence-control" for="${id}">
        <span>${escapeHtml(label)} <strong id="${id}-value">${escapeHtml(prefix)}${escapeHtml(value)}${escapeHtml(suffix)}</strong></span>
        <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      </label>
    `;
  }

  function ensureInterface() {
    if (document.querySelector('#forge-intelligence-v2')) return;

    section.classList.add('intelligence-v2-enabled');
    simulator.insertAdjacentHTML('beforebegin', `
      <div class="intelligence-version-row">
        <span>Forge Intelligence v2</span>
        <p>User inputs, calculated scenarios, assumptions, and human validation remain visibly separated.</p>
      </div>
    `);

    simulator.insertAdjacentHTML('afterend', `
      <section class="intelligence-workbench" id="forge-intelligence-v2" aria-labelledby="intelligence-workbench-title">
        <div class="intelligence-workbench-header">
          <div>
            <p class="eyebrow">OPERATIONAL SCENARIO WORKBENCH</p>
            <h3 id="intelligence-workbench-title">Model the process around the idea</h3>
            <p>Use approximate operating conditions to identify what should be validated, what an MVP should contain, and how adoption could be staged.</p>
          </div>
          <div class="intelligence-provenance" aria-label="Data provenance legend">
            <span data-kind="input">User-supplied</span>
            <span data-kind="calculated">Calculated</span>
            <span data-kind="assumption">Assumption</span>
            <span data-kind="review">Human review</span>
          </div>
        </div>

        <div class="scenario-presets" aria-label="Example operating scenarios">
          <span>Load fictional scenario:</span>
          ${Object.entries(presets).map(([key, preset]) => `<button type="button" data-scenario-preset="${key}">${escapeHtml(preset.label)}</button>`).join('')}
          <button type="button" class="reset-scenario" id="reset-intelligence-scenario">Reset</button>
        </div>

        <div class="intelligence-input-grid">
          ${rangeControl({ id: 'users-slider', label: 'People using the process', min: 1, max: 250, step: 1, value: defaults.users })}
          ${rangeControl({ id: 'branches-slider', label: 'Branches or operating sites', min: 1, max: 50, step: 1, value: defaults.branches })}
          ${rangeControl({ id: 'error-rate-slider', label: 'Current error rate', min: 0, max: 30, step: 1, value: defaults.errorRate, suffix: '%' })}
          ${rangeControl({ id: 'rework-rate-slider', label: 'Operations requiring rework', min: 0, max: 50, step: 1, value: defaults.reworkRate, suffix: '%' })}
          ${rangeControl({ id: 'growth-rate-slider', label: 'Expected monthly growth', min: 0, max: 20, step: 1, value: defaults.growthRate, suffix: '%' })}
          ${rangeControl({ id: 'software-cost-slider', label: 'Current monthly software cost', min: 0, max: 2000000, step: 10000, value: defaults.softwareCost, prefix: 'CLP ' })}
          ${rangeControl({ id: 'handoffs-slider', label: 'Manual handoffs', min: 0, max: 15, step: 1, value: defaults.handoffs })}
          ${rangeControl({ id: 'spreadsheets-slider', label: 'Active spreadsheets', min: 0, max: 20, step: 1, value: defaults.spreadsheets })}
          ${rangeControl({ id: 'systems-slider', label: 'Systems involved', min: 1, max: 12, step: 1, value: defaults.systems })}
        </div>

        <div class="intelligence-output" aria-live="polite">
          <div class="scenario-metrics" id="scenario-metrics"></div>

          <div class="scenario-analysis-grid">
            <article class="scenario-panel infrastructure-panel">
              <p class="eyebrow">COMPLEXITY & INFRASTRUCTURE</p>
              <div class="complexity-heading">
                <div><small>Complexity classification</small><strong id="complexity-label">Focused</strong></div>
                <span id="complexity-score">0 / 100</span>
              </div>
              <div class="complexity-track" aria-hidden="true"><span id="complexity-track-value"></span></div>
              <h4 id="infrastructure-tier"></h4>
              <p id="infrastructure-summary"></p>
            </article>

            <article class="scenario-panel">
              <p class="eyebrow">RECOMMENDED MVP SCOPE</p>
              <ul id="scenario-mvp-scope"></ul>
            </article>

            <article class="scenario-panel">
              <p class="eyebrow">ADOPTION PLAN</p>
              <ol id="scenario-adoption-plan"></ol>
            </article>
          </div>

          <details class="scenario-assumptions">
            <summary>Review calculation assumptions and limitations</summary>
            <ul id="scenario-assumption-list"></ul>
            <p>These values describe capacity and operational scenarios. They do not guarantee savings, adoption, feasibility, revenue, or commercial success.</p>
          </details>
        </div>
      </section>
    `);
  }

  function inputValue(id, fallback = 0) {
    const element = document.querySelector(`#${id}`);
    return element ? Number(element.value) : fallback;
  }

  function collectInput() {
    return {
      operations: inputValue('operations-slider', defaults.operations),
      minutes: inputValue('minutes-slider', defaults.minutes),
      reduction: inputValue('reduction-slider', defaults.reduction),
      hourlyValue: inputValue('hourly-value-slider', defaults.hourlyValue),
      users: inputValue('users-slider', defaults.users),
      branches: inputValue('branches-slider', defaults.branches),
      errorRate: inputValue('error-rate-slider', defaults.errorRate),
      reworkRate: inputValue('rework-rate-slider', defaults.reworkRate),
      growthRate: inputValue('growth-rate-slider', defaults.growthRate),
      softwareCost: inputValue('software-cost-slider', defaults.softwareCost),
      handoffs: inputValue('handoffs-slider', defaults.handoffs),
      spreadsheets: inputValue('spreadsheets-slider', defaults.spreadsheets),
      systems: inputValue('systems-slider', defaults.systems),
    };
  }

  function updateControlLabels(input) {
    const labels = {
      'users-slider-value': formatInteger(input.users),
      'branches-slider-value': formatInteger(input.branches),
      'error-rate-slider-value': `${formatInteger(input.errorRate)}%`,
      'rework-rate-slider-value': `${formatInteger(input.reworkRate)}%`,
      'growth-rate-slider-value': `${formatInteger(input.growthRate)}%`,
      'software-cost-slider-value': formatCLP(input.softwareCost),
      'handoffs-slider-value': formatInteger(input.handoffs),
      'spreadsheets-slider-value': formatInteger(input.spreadsheets),
      'systems-slider-value': formatInteger(input.systems),
    };
    Object.entries(labels).forEach(([id, value]) => {
      const target = document.querySelector(`#${id}`);
      if (target) target.textContent = value;
    });
  }

  function renderMetrics(result) {
    const metrics = [
      ['Adjusted manual effort', `${formatDecimal(result.metrics.adjustedManualHours)} h`, 'per month after modeled friction'],
      ['Potential time released', `${formatDecimal(result.metrics.potentialHoursReleased)} h`, 'per month · exploratory'],
      ['Annual capacity value', formatCLP(result.metrics.annualCapacityValue), 'capacity scenario, not cash savings'],
      ['Operations with errors', formatDecimal(result.metrics.errorOperations), 'per month at supplied rate'],
      ['Current rework effort', `${formatDecimal(result.metrics.monthlyReworkHours)} h`, 'per month'],
      ['Projected monthly volume', formatInteger(result.metrics.projectedMonthlyOperations), 'after 12 months of supplied growth'],
      ['Annual software baseline', formatCLP(result.metrics.annualSoftwareCost), 'current cost input × 12'],
      ['Friction multiplier', `${formatDecimal(result.metrics.frictionMultiplier, 2)}×`, 'scenario adjustment, not measured fact'],
    ];

    document.querySelector('#scenario-metrics').innerHTML = metrics.map(([label, value, note]) => `
      <article>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(note)}</span>
      </article>
    `).join('');
  }

  function renderAnalysis(result) {
    document.querySelector('#complexity-label').textContent = result.complexity.label;
    document.querySelector('#complexity-label').dataset.complexity = result.complexity.key;
    document.querySelector('#complexity-score').textContent = `${result.complexity.score} / 100`;
    document.querySelector('#complexity-track-value').style.width = `${result.complexity.score}%`;
    document.querySelector('#infrastructure-tier').textContent = result.infrastructure.tier;
    document.querySelector('#infrastructure-summary').textContent = result.infrastructure.summary;
    document.querySelector('#scenario-mvp-scope').innerHTML = result.mvpScope.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    document.querySelector('#scenario-adoption-plan').innerHTML = result.adoptionPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    document.querySelector('#scenario-assumption-list').innerHTML = result.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderScenario() {
    const input = collectInput();
    const result = core.calculateScenario(input);
    updateControlLabels(result.input);
    renderMetrics(result);
    renderAnalysis(result);
  }

  function setScenario(values) {
    const mapping = {
      operations: 'operations-slider',
      minutes: 'minutes-slider',
      reduction: 'reduction-slider',
      hourlyValue: 'hourly-value-slider',
      users: 'users-slider',
      branches: 'branches-slider',
      errorRate: 'error-rate-slider',
      reworkRate: 'rework-rate-slider',
      growthRate: 'growth-rate-slider',
      softwareCost: 'software-cost-slider',
      handoffs: 'handoffs-slider',
      spreadsheets: 'spreadsheets-slider',
      systems: 'systems-slider',
    };

    Object.entries(mapping).forEach(([key, id]) => {
      const input = document.querySelector(`#${id}`);
      if (!input || values[key] === undefined) return;
      input.value = values[key];
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    renderScenario();
  }

  function wireEvents() {
    const ids = [
      'operations-slider', 'minutes-slider', 'reduction-slider', 'hourly-value-slider',
      'users-slider', 'branches-slider', 'error-rate-slider', 'rework-rate-slider',
      'growth-rate-slider', 'software-cost-slider', 'handoffs-slider',
      'spreadsheets-slider', 'systems-slider',
    ];

    ids.forEach((id) => document.querySelector(`#${id}`)?.addEventListener('input', renderScenario));

    document.querySelectorAll('[data-scenario-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-scenario-preset]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
        setScenario(presets[button.dataset.scenarioPreset]);
      });
    });

    document.querySelector('#reset-intelligence-scenario')?.addEventListener('click', () => {
      document.querySelectorAll('[data-scenario-preset]').forEach((button) => button.classList.remove('active'));
      setScenario(defaults);
    });
  }

  ensureInterface();
  wireEvents();
  renderScenario();
})();
