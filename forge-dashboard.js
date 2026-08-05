(() => {
  const reviewSection = document.querySelector('.review-section');
  if (!reviewSection) return;

  const records = [
    {
      id: 'CF-2026-001',
      submitted: '05 Aug 2026',
      contact: 'Demo Contact A',
      organization: 'North Dock Logistics',
      idea: 'Create one place to capture delivery evidence, classify damage, and assign the next action.',
      industry: 'Logistics',
      users: 'Drivers, warehouse reviewers, coordinators',
      format: 'Mobile-first web app',
      data: 'Photos, delivery sheets, exception codes',
      privacy: 'Restricted',
      potential: 'High',
      feasibility: 'High',
      complexity: 'Medium',
      reuse: 'High',
      saas: 'High',
      next: 'Run a five-user evidence workflow test',
      reviewer: 'E. Flores',
      status: 'Awaiting human review',
      consent: 'Contact only',
      story: 'Not eligible',
      files: 3,
      revisions: 2,
      notes: 'Validate offline capture, evidence retention, and role-based access before proposal preparation.',
      audit: ['Idea submitted', 'Automated preview generated', 'Privacy set to restricted'],
    },
    {
      id: 'CF-2026-002',
      submitted: '05 Aug 2026',
      contact: 'Demo Contact B',
      organization: 'Barrio Fresh Market',
      idea: 'Help small shops see products close to expiry and decide what to discount first.',
      industry: 'Retail',
      users: 'Shop staff, purchasing lead, owner',
      format: 'Web application',
      data: 'Inventory spreadsheet and expiry dates',
      privacy: 'Private',
      potential: 'High',
      feasibility: 'High',
      complexity: 'Low',
      reuse: 'High',
      saas: 'High',
      next: 'Validate current stock-capture effort',
      reviewer: 'Unassigned',
      status: 'New idea',
      consent: 'Contact only',
      story: 'Not evaluated',
      files: 1,
      revisions: 1,
      notes: 'Promising reusable workflow. Avoid assuming inventory accuracy until a baseline sample is reviewed.',
      audit: ['Idea submitted', 'Fictional blueprint generated'],
    },
    {
      id: 'CF-2026-003',
      submitted: '04 Aug 2026',
      contact: 'Anonymous demo user',
      organization: 'Community Support Network',
      idea: 'Allow older adults to request trusted local assistance without navigating complicated menus.',
      industry: 'Accessibility',
      users: 'Older adults, trusted contacts, coordinators',
      format: 'Accessible mobile experience',
      data: 'No structured data yet',
      privacy: 'Sensitive',
      potential: 'Medium',
      feasibility: 'Medium',
      complexity: 'High',
      reuse: 'Medium',
      saas: 'Low',
      next: 'Safeguarding and accessibility discovery',
      reviewer: 'A. Rivera',
      status: 'Feasibility analysis',
      consent: 'Anonymous contact',
      story: 'Anonymous only',
      files: 0,
      revisions: 3,
      notes: 'Requires explicit safeguarding, assisted-access, and incident-response design before prototyping.',
      audit: ['Idea submitted anonymously', 'Accessibility risks documented', 'Reviewer assigned'],
    },
    {
      id: 'CF-2026-004',
      submitted: '03 Aug 2026',
      contact: 'Demo Contact C',
      organization: 'CareRoute Clinic',
      idea: 'Coordinate appointment booking, preparation, visit completion, and follow-up in one workflow.',
      industry: 'Clinic operations',
      users: 'Reception, clinicians, administrators',
      format: 'Internal dashboard',
      data: 'Appointment exports and process notes',
      privacy: 'Sensitive',
      potential: 'High',
      feasibility: 'Medium',
      complexity: 'High',
      reuse: 'Medium',
      saas: 'Medium',
      next: 'Map sensitive-data boundaries',
      reviewer: 'E. Flores',
      status: 'Discovery completed',
      consent: 'NDA requested',
      story: 'Blocked',
      files: 4,
      revisions: 4,
      notes: 'Exclude medical decision support. Confirm legal basis, retention, and organizational access model.',
      audit: ['NDA requested', 'Discovery completed', 'Sensitive-data review opened'],
    },
    {
      id: 'CF-2026-005',
      submitted: '02 Aug 2026',
      contact: 'Demo Contact D',
      organization: 'Kitchen Pulse Bakery',
      idea: 'Replace paper production boards with a shared live status across three kitchen stations.',
      industry: 'Food production',
      users: 'Production staff, counter team, shift lead',
      format: 'Local-first web app',
      data: 'Order tickets and station timing notes',
      privacy: 'Private',
      potential: 'High',
      feasibility: 'High',
      complexity: 'Medium',
      reuse: 'High',
      saas: 'Medium',
      next: 'Confirm pilot hardware and connectivity',
      reviewer: 'M. Soto',
      status: 'Prototype approved',
      consent: 'Commercial follow-up',
      story: 'Future candidate',
      files: 2,
      revisions: 5,
      notes: 'Pilot should remain limited to one shift, three stations, and measurable delay categories.',
      audit: ['Prototype approved', 'Pilot scope reduced', 'Hardware assumptions recorded'],
    },
    {
      id: 'CF-2026-006',
      submitted: '01 Aug 2026',
      contact: 'Demo Contact E',
      organization: 'Field Maintain Services',
      idea: 'Use QR codes to show equipment maintenance history and unresolved work in the field.',
      industry: 'Field services',
      users: 'Technicians, supervisors, asset owners',
      format: 'Mobile-first application',
      data: 'Maintenance logs and equipment list',
      privacy: 'Restricted',
      potential: 'High',
      feasibility: 'High',
      complexity: 'Medium',
      reuse: 'High',
      saas: 'High',
      next: 'Build QR and offline prototype',
      reviewer: 'E. Flores',
      status: 'Proposal preparation',
      consent: 'Commercial follow-up',
      story: 'Future candidate',
      files: 5,
      revisions: 3,
      notes: 'Test durable identifiers, offline conflict handling, and audit-history ownership.',
      audit: ['Feasibility accepted', 'Proposal preparation started', 'Story consent not requested'],
    },
    {
      id: 'CF-2026-007',
      submitted: '30 Jul 2026',
      contact: 'Demo Contact F',
      organization: 'Constructa Tools',
      idea: 'Track borrowed construction tools, custody, condition, and return using QR codes.',
      industry: 'Construction',
      users: 'Workers, supervisors, warehouse staff',
      format: 'Hardware-connected product',
      data: 'Asset register and loan sheets',
      privacy: 'Private',
      potential: 'Medium',
      feasibility: 'High',
      complexity: 'Medium',
      reuse: 'High',
      saas: 'High',
      next: 'Prototype one custody loop',
      reviewer: 'A. Rivera',
      status: 'Testing',
      consent: 'Prototype contact',
      story: 'Candidate pending approval',
      files: 2,
      revisions: 6,
      notes: 'Current prototype measures custody completion, overdue assets, and evidence quality.',
      audit: ['Prototype created', 'Field test opened', 'Publication permission pending'],
    },
    {
      id: 'CF-2026-008',
      submitted: '28 Jul 2026',
      contact: 'Demo Contact G',
      organization: 'Neighbour Commerce Lab',
      idea: 'Validate a startup that helps neighborhood businesses share unused delivery capacity.',
      industry: 'Startup validation',
      users: 'Local merchants, drivers, coordinators',
      format: 'Marketplace concept',
      data: 'Interview notes only',
      privacy: 'Private',
      potential: 'Medium',
      feasibility: 'Low',
      complexity: 'High',
      reuse: 'Medium',
      saas: 'Medium',
      next: 'Test demand without building software',
      reviewer: 'M. Soto',
      status: 'Experiment discontinued',
      consent: 'No further contact',
      story: 'Lessons-learned candidate',
      files: 0,
      revisions: 2,
      notes: 'Discovery did not confirm enough repeated demand. Preserve learning without implying product failure.',
      audit: ['Demand experiment completed', 'Build recommendation rejected', 'Record retained for lessons learned'],
    },
  ];

  const state = {
    search: '',
    status: 'all',
    privacy: 'all',
    selectedId: records[0].id,
    expanded: false,
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character]);
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function ensureDashboard() {
    if (document.querySelector('#internal-forge-dashboard')) return;

    reviewSection.insertAdjacentHTML('beforebegin', `
      <section class="dashboard-section" id="internal-forge-dashboard" aria-labelledby="dashboard-title">
        <div class="section-heading split-heading dashboard-heading">
          <div>
            <p class="eyebrow">INTERNAL FORGE DASHBOARD · DEMO</p>
            <h2 id="dashboard-title">Turn public ideas into accountable opportunities.</h2>
          </div>
          <div class="dashboard-intro">
            <p>Fictional operational records show how submissions can move through review, discovery, feasibility, delivery, and outcome follow-up.</p>
            <button class="button button-secondary" type="button" id="dashboard-toggle" aria-expanded="false" aria-controls="dashboard-workspace">Open internal demo</button>
          </div>
        </div>

        <div class="dashboard-trust-row">
          <span>No real submissions</span>
          <span>Private-by-default model</span>
          <span>Role-based access planned</span>
          <span>Audit history represented</span>
        </div>

        <div class="dashboard-workspace" id="dashboard-workspace" hidden>
          <div class="dashboard-summary" id="dashboard-summary"></div>

          <div class="pipeline-strip" id="pipeline-strip" aria-label="Opportunity pipeline"></div>

          <div class="dashboard-controls" aria-label="Dashboard filters">
            <label class="dashboard-search">
              <span>Search ideas, organizations, or IDs</span>
              <input id="dashboard-search" type="search" placeholder="Search fictional records" autocomplete="off" />
            </label>
            <label>
              <span>Status</span>
              <select id="dashboard-status-filter">
                <option value="all">All statuses</option>
                <option value="New idea">New idea</option>
                <option value="Awaiting human review">Awaiting human review</option>
                <option value="Feasibility analysis">Feasibility analysis</option>
                <option value="Discovery completed">Discovery completed</option>
                <option value="Prototype approved">Prototype approved</option>
                <option value="Proposal preparation">Proposal preparation</option>
                <option value="Testing">Testing</option>
                <option value="Experiment discontinued">Experiment discontinued</option>
              </select>
            </label>
            <label>
              <span>Privacy</span>
              <select id="dashboard-privacy-filter">
                <option value="all">All classifications</option>
                <option value="Private">Private</option>
                <option value="Restricted">Restricted</option>
                <option value="Sensitive">Sensitive</option>
              </select>
            </label>
            <div class="dashboard-result" id="dashboard-result" role="status"></div>
          </div>

          <div class="dashboard-layout">
            <div class="opportunity-list" id="opportunity-list" aria-label="Fictional opportunity records"></div>
            <aside class="opportunity-detail" id="opportunity-detail" aria-live="polite"></aside>
          </div>

          <aside class="dashboard-boundary" aria-label="Internal dashboard implementation boundary">
            <strong>Demo boundary</strong>
            <p>This static interface does not authenticate users, persist submissions, upload files, or change workflow status. Production requires secure backend storage, RBAC, audit logs, retention controls, malware scanning, and explicit consent records.</p>
          </aside>
        </div>
      </section>
    `);
  }

  function filteredRecords() {
    const query = state.search.trim().toLowerCase();
    return records.filter((record) => {
      const searchMatches = !query || [record.id, record.organization, record.idea, record.industry, record.reviewer]
        .some((value) => value.toLowerCase().includes(query));
      const statusMatches = state.status === 'all' || record.status === state.status;
      const privacyMatches = state.privacy === 'all' || record.privacy === state.privacy;
      return searchMatches && statusMatches && privacyMatches;
    });
  }

  function renderSummary() {
    const active = records.filter((record) => !['Experiment discontinued'].includes(record.status)).length;
    const sensitive = records.filter((record) => record.privacy === 'Sensitive').length;
    const highReuse = records.filter((record) => record.reuse === 'High').length;
    const storyCandidates = records.filter((record) => /candidate/i.test(record.story)).length;

    document.querySelector('#dashboard-summary').innerHTML = [
      ['Open opportunities', active, 'fictional records'],
      ['Sensitive ideas', sensitive, 'require tighter handling'],
      ['High reuse potential', highReuse, 'exploratory classification'],
      ['Story candidates', storyCandidates, 'permission still required'],
    ].map(([label, value, note]) => `
      <article><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong><span>${escapeHtml(note)}</span></article>
    `).join('');
  }

  function renderPipeline() {
    const stages = [
      ['Intake', ['New idea', 'Awaiting human review']],
      ['Discovery', ['Feasibility analysis', 'Discovery completed']],
      ['Commercial', ['Proposal preparation']],
      ['Build', ['Prototype approved', 'Testing']],
      ['Learning', ['Experiment discontinued']],
    ];

    document.querySelector('#pipeline-strip').innerHTML = stages.map(([label, statuses], index) => {
      const count = records.filter((record) => statuses.includes(record.status)).length;
      return `
        <article>
          <span>${String(index + 1).padStart(2, '0')}</span>
          <div><small>${escapeHtml(label)}</small><strong>${count}</strong></div>
        </article>
      `;
    }).join('');
  }

  function renderList() {
    const filtered = filteredRecords();
    const list = document.querySelector('#opportunity-list');
    const result = document.querySelector('#dashboard-result');

    result.textContent = `${filtered.length} of ${records.length} fictional records`;

    if (!filtered.some((record) => record.id === state.selectedId)) {
      state.selectedId = filtered[0]?.id || '';
    }

    if (!filtered.length) {
      list.innerHTML = '<div class="dashboard-empty"><strong>No matching records</strong><p>Adjust the status, privacy, or search filters.</p></div>';
      renderDetail(null);
      return;
    }

    list.innerHTML = filtered.map((record) => `
      <button type="button" class="opportunity-row ${record.id === state.selectedId ? 'selected' : ''}" data-opportunity-id="${escapeHtml(record.id)}" aria-pressed="${record.id === state.selectedId ? 'true' : 'false'}">
        <div class="opportunity-primary">
          <span>${escapeHtml(record.id)}</span>
          <strong>${escapeHtml(record.organization)}</strong>
          <p>${escapeHtml(record.idea)}</p>
        </div>
        <div class="opportunity-facts">
          <span class="privacy-pill privacy-${slug(record.privacy)}">${escapeHtml(record.privacy)}</span>
          <span>${escapeHtml(record.industry)}</span>
          <span>${escapeHtml(record.reviewer)}</span>
          <strong>${escapeHtml(record.status)}</strong>
        </div>
      </button>
    `).join('');

    list.querySelectorAll('[data-opportunity-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedId = button.dataset.opportunityId;
        renderList();
        renderDetail(records.find((record) => record.id === state.selectedId));
      });
    });

    renderDetail(records.find((record) => record.id === state.selectedId));
  }

  function scoreCard(label, value) {
    return `<article><small>${escapeHtml(label)}</small><strong class="score-${slug(value)}">${escapeHtml(value)}</strong></article>`;
  }

  function renderDetail(record) {
    const detail = document.querySelector('#opportunity-detail');
    if (!record) {
      detail.innerHTML = '<div class="dashboard-empty"><strong>No opportunity selected</strong><p>Select a fictional record to inspect its structured review data.</p></div>';
      return;
    }

    detail.innerHTML = `
      <div class="detail-header">
        <div>
          <p class="eyebrow">OPPORTUNITY RECORD</p>
          <h3>${escapeHtml(record.organization)}</h3>
          <span>${escapeHtml(record.id)} · Submitted ${escapeHtml(record.submitted)}</span>
        </div>
        <span class="privacy-pill privacy-${slug(record.privacy)}">${escapeHtml(record.privacy)}</span>
      </div>

      <section class="detail-idea">
        <small>Original idea</small>
        <p>${escapeHtml(record.idea)}</p>
      </section>

      <div class="detail-score-grid">
        ${scoreCard('Commercial potential', record.potential)}
        ${scoreCard('Technical feasibility', record.feasibility)}
        ${scoreCard('Complexity', record.complexity)}
        ${scoreCard('Reuse potential', record.reuse)}
        ${scoreCard('SaaS potential', record.saas)}
      </div>

      <dl class="record-fields">
        <div><dt>Status</dt><dd>${escapeHtml(record.status)}</dd></div>
        <div><dt>Assigned reviewer</dt><dd>${escapeHtml(record.reviewer)}</dd></div>
        <div><dt>Industry</dt><dd>${escapeHtml(record.industry)}</dd></div>
        <div><dt>Target users</dt><dd>${escapeHtml(record.users)}</dd></div>
        <div><dt>Product format</dt><dd>${escapeHtml(record.format)}</dd></div>
        <div><dt>Available data</dt><dd>${escapeHtml(record.data)}</dd></div>
        <div><dt>Files</dt><dd>${escapeHtml(record.files)}</dd></div>
        <div><dt>Blueprint revisions</dt><dd>${escapeHtml(record.revisions)}</dd></div>
        <div><dt>Contact consent</dt><dd>${escapeHtml(record.consent)}</dd></div>
        <div><dt>Story publication</dt><dd>${escapeHtml(record.story)}</dd></div>
      </dl>

      <section class="next-action-card">
        <small>Suggested next step</small>
        <strong>${escapeHtml(record.next)}</strong>
        <p>${escapeHtml(record.notes)}</p>
      </section>

      <section class="audit-preview">
        <p class="eyebrow">AUDIT HISTORY · DEMO</p>
        <ol>
          ${record.audit.map((event, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(event)}</strong></li>`).join('')}
        </ol>
      </section>
    `;
  }

  function toggleDashboard() {
    state.expanded = !state.expanded;
    const workspace = document.querySelector('#dashboard-workspace');
    const button = document.querySelector('#dashboard-toggle');
    workspace.hidden = !state.expanded;
    button.setAttribute('aria-expanded', String(state.expanded));
    button.textContent = state.expanded ? 'Close internal demo' : 'Open internal demo';
    if (state.expanded) {
      renderSummary();
      renderPipeline();
      renderList();
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function wireEvents() {
    document.querySelector('#dashboard-toggle').addEventListener('click', toggleDashboard);
    document.querySelector('#dashboard-search').addEventListener('input', (event) => {
      state.search = event.target.value;
      renderList();
    });
    document.querySelector('#dashboard-status-filter').addEventListener('change', (event) => {
      state.status = event.target.value;
      renderList();
    });
    document.querySelector('#dashboard-privacy-filter').addEventListener('change', (event) => {
      state.privacy = event.target.value;
      renderList();
    });
  }

  ensureDashboard();
  wireEvents();
})();
