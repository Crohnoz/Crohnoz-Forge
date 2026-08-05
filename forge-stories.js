(() => {
  const section = document.querySelector('#stories');
  const storyGrid = section?.querySelector('.story-grid');

  if (!section || !storyGrid) return;

  const stories = [
    {
      id: 'proof-flow',
      category: 'operations',
      categoryLabel: 'Operations',
      title: 'From scattered delivery evidence to one traceable workflow',
      status: 'Prototype created',
      identity: 'Anonymous public version',
      summary: 'A logistics team arrived with photos, spreadsheets, and status messages distributed across different channels.',
      problem: 'Delivery exceptions were difficult to reconstruct because evidence, ownership, and resolution notes lived in separate tools.',
      idea: 'Create one mobile-first place to capture delivery evidence and assign the next action.',
      clarified: 'The critical requirement was not more reporting. It was a reliable chain of custody for every exception.',
      built: 'A fictional interactive prototype with evidence capture, exception classification, ownership, and an auditable event timeline.',
      outcome: 'The demo established one shared workflow and exposed which operational measurements would be required in a real pilot.',
      quote: 'The Forge helped separate the reporting problem from the real accountability problem.',
      evidence: 'System-shaped demo indicators',
      metrics: [
        ['Roles connected', '4'],
        ['Shared workflows', '1'],
        ['Real client data', '0%'],
      ],
      consent: {
        publication: 'Demo publication approved',
        identity: 'Organization name hidden',
        figures: 'Only fictional figures shown',
        screenshots: 'Prototype screenshots permitted',
      },
      timeline: [
        ['Raw idea', 'Photos and statuses are scattered after deliveries.'],
        ['Discovery', 'Accountability and event history became the central problem.'],
        ['Blueprint', 'A shared evidence and exception workflow was defined.'],
        ['Prototype', 'Capture, review, and resolution screens were simulated.'],
        ['Testing', 'Representative operational scenarios were walked through.'],
        ['Outcome', 'Prototype created; real process data still required.'],
      ],
    },
    {
      id: 'shelf-signal',
      category: 'retail',
      categoryLabel: 'Retail',
      title: 'A simple expiry warning became a reusable inventory concept',
      status: 'Concept clarified',
      identity: 'Named fictional business',
      summary: 'The initial request was one alert. Discovery revealed opportunities in discounts, waste reporting, and purchasing.',
      problem: 'Small shops notice expiry risk too late and have no simple way to prioritize products that need action.',
      idea: 'Send an alert when a product is close to expiry.',
      clarified: 'The alert only creates value when it leads to a prioritized action and records what happened afterward.',
      built: 'A demo blueprint with batch capture, expiry-risk queues, suggested actions, and outcome notes.',
      outcome: 'The concept moved from a notification feature to a measurable operational workflow suitable for an MVP test.',
      quote: 'We arrived asking for an alert and left with a clearer product boundary.',
      evidence: 'Client-style narrative; fictional metrics',
      metrics: [
        ['Core workflow steps', '4'],
        ['MVP roles', '3'],
        ['Validated savings', 'Not yet'],
      ],
      consent: {
        publication: 'Fictional demo content',
        identity: 'No real identity used',
        figures: 'No sensitive figures included',
        screenshots: 'Generated interface only',
      },
      timeline: [
        ['Raw idea', 'Warn shops before products expire.'],
        ['Discovery', 'Discount, waste, and purchasing decisions were connected.'],
        ['Blueprint', 'The action queue became the MVP center.'],
        ['Prototype', 'Overview, batch capture, and insights were simulated.'],
        ['Testing', 'Awaiting real shop workflow validation.'],
        ['Outcome', 'Concept clarified and ready for discovery interviews.'],
      ],
    },
    {
      id: 'neighbour-link',
      category: 'accessibility',
      categoryLabel: 'Accessibility',
      title: 'The product became simpler after speaking with real-user constraints',
      status: 'Still being forged',
      identity: 'Anonymous community scenario',
      summary: 'The Forge removed unnecessary registration steps and prioritized trusted contacts, large actions, and guided flows.',
      problem: 'Older adults may need local support but can be excluded by dense menus, account creation, or unclear trust signals.',
      idea: 'Build a marketplace where people can request nearby help.',
      clarified: 'The experience needed assisted access, clear trust relationships, and fewer decisions rather than marketplace complexity.',
      built: 'A fictional low-friction flow with large actions, trusted contacts, assisted requests, and coordinator visibility.',
      outcome: 'The product direction became smaller, safer, and more accessible, while open questions about safeguarding remained visible.',
      quote: 'Removing features made the concept stronger because the critical journey became obvious.',
      evidence: 'Human-centered design assumptions',
      metrics: [
        ['Registration steps removed', '2'],
        ['Primary actions', '3'],
        ['Safeguarding review', 'Required'],
      ],
      consent: {
        publication: 'Fictional demo content',
        identity: 'Anonymous by design',
        figures: 'No personal figures shown',
        screenshots: 'Concept screens only',
      },
      timeline: [
        ['Raw idea', 'Connect older adults with trusted local assistance.'],
        ['Discovery', 'Trust and accessibility outweighed marketplace breadth.'],
        ['Blueprint', 'Assisted requests and trusted contacts were prioritized.'],
        ['Prototype', 'Large-action mobile screens were outlined.'],
        ['Testing', 'Accessibility and safeguarding validation remain pending.'],
        ['Outcome', 'Still being forged with a safer product boundary.'],
      ],
    },
    {
      id: 'care-route',
      category: 'healthcare',
      categoryLabel: 'Clinic operations',
      title: 'A scheduling request exposed a wider service-coordination problem',
      status: 'MVP scoped',
      identity: 'Anonymous clinic scenario',
      summary: 'A clinic scheduling idea expanded into a controlled workflow for availability, visit preparation, and follow-up.',
      problem: 'Appointments can be booked, but preparation, role ownership, and follow-up are frequently disconnected.',
      idea: 'Create a better booking calendar for a small clinic.',
      clarified: 'The appointment itself was only one stage of a broader service journey with privacy and continuity requirements.',
      built: 'A fictional MVP boundary covering booking, availability, preparation status, visit completion, and follow-up tasks.',
      outcome: 'The demo identified a feasible first release while excluding medical decision support and sensitive clinical automation.',
      quote: 'The most useful result was knowing what the first version should not attempt.',
      evidence: 'Blueprint-derived scope evidence',
      metrics: [
        ['MVP journey stages', '5'],
        ['Excluded high-risk functions', '3'],
        ['Clinical validation', 'Required'],
      ],
      consent: {
        publication: 'Fictional demo content',
        identity: 'Clinic identity hidden',
        figures: 'Operational ranges only',
        screenshots: 'No patient data displayed',
      },
      timeline: [
        ['Raw idea', 'Improve appointment scheduling.'],
        ['Discovery', 'Preparation and follow-up gaps were identified.'],
        ['Blueprint', 'A five-stage service journey was defined.'],
        ['Prototype', 'Operational screens were simulated without clinical data.'],
        ['Testing', 'Staff workflow interviews are the recommended next step.'],
        ['Outcome', 'MVP scoped with clear privacy boundaries.'],
      ],
    },
    {
      id: 'kitchen-pulse',
      category: 'food',
      categoryLabel: 'Food production',
      title: 'A paper production board became a shared kitchen operations concept',
      status: 'Pilot designed',
      identity: 'Named fictional bakery',
      summary: 'A restaurant-production problem was shaped into a simple live board for orders, batches, shortages, and completion.',
      problem: 'Kitchen teams coordinate production through paper, verbal updates, and multiple screens that do not share one status.',
      idea: 'Replace the paper board with something visible from every station.',
      clarified: 'The first release needed extreme speed, offline tolerance, and one shared definition of production status.',
      built: 'A fictional station board with order grouping, batch progress, shortage flags, and completion handoffs.',
      outcome: 'A pilot plan was defined around three stations, one shift, and a small set of measurable production delays.',
      quote: 'The pilot became practical once the Forge limited it to one shift and one kitchen.',
      evidence: 'Pilot-plan assumptions',
      metrics: [
        ['Pilot stations', '3'],
        ['Pilot duration', '2 weeks'],
        ['Measured baseline', 'Pending'],
      ],
      consent: {
        publication: 'Fictional demo content',
        identity: 'Fictional name only',
        figures: 'Pilot assumptions shown',
        screenshots: 'Demo screens permitted',
      },
      timeline: [
        ['Raw idea', 'Replace a paper production board.'],
        ['Discovery', 'Speed and shared status were prioritized.'],
        ['Blueprint', 'One live production workflow was defined.'],
        ['Prototype', 'Station and coordinator views were simulated.'],
        ['Testing', 'A two-week fictional pilot was designed.'],
        ['Outcome', 'Pilot designed; operational baseline pending.'],
      ],
    },
    {
      id: 'field-maintain',
      category: 'field-services',
      categoryLabel: 'Field services',
      title: 'Maintenance notes became a traceable service history',
      status: 'Prototype-ready',
      identity: 'Anonymous service company',
      summary: 'Technician notes, equipment history, and pending actions were consolidated into one mobile-first concept.',
      problem: 'Field technicians record work in messages and photos, leaving supervisors without a consistent equipment history.',
      idea: 'Give every machine a QR code with its maintenance notes.',
      clarified: 'The QR code was only the entry point; custody, evidence quality, and unresolved actions created the real operational value.',
      built: 'A fictional blueprint for QR access, service evidence, condition history, pending actions, and supervisor review.',
      outcome: 'The concept became prototype-ready with clear offline, identity, and audit-history risks documented.',
      quote: 'The Forge turned a QR feature into a service-accountability workflow.',
      evidence: 'Technical feasibility assumptions',
      metrics: [
        ['User roles', '3'],
        ['Critical risks documented', '4'],
        ['Field test', 'Pending'],
      ],
      consent: {
        publication: 'Fictional demo content',
        identity: 'Organization anonymous',
        figures: 'No commercial figures shown',
        screenshots: 'Generated mock screens only',
      },
      timeline: [
        ['Raw idea', 'Attach maintenance notes to equipment QR codes.'],
        ['Discovery', 'Audit history and unresolved work became central.'],
        ['Blueprint', 'A field-service chain of accountability was defined.'],
        ['Prototype', 'Mobile capture and supervisor review were outlined.'],
        ['Testing', 'Offline and QR durability tests remain pending.'],
        ['Outcome', 'Prototype-ready with risks explicitly documented.'],
      ],
    },
  ];

  let lastTrigger = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character]);
  }

  function renderLibrary() {
    let filters = section.querySelector('.story-filter-row');
    if (!filters) {
      storyGrid.insertAdjacentHTML('beforebegin', '<div class="story-filter-row"></div>');
      filters = section.querySelector('.story-filter-row');
    }

    const categories = [
      ['all', 'All stories'],
      ['operations', 'Operations'],
      ['retail', 'Retail'],
      ['accessibility', 'Accessibility'],
      ['healthcare', 'Clinic'],
      ['food', 'Food'],
      ['field-services', 'Field services'],
    ];

    filters.innerHTML = `
      <span>Explore fictional outcomes:</span>
      ${categories.map(([value, label], index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-story-filter="${value}" aria-pressed="${index === 0 ? 'true' : 'false'}">${label}</button>`).join('')}
      <small id="story-result-count">${stories.length} demo stories</small>
    `;

    storyGrid.classList.add('story-library');
    storyGrid.innerHTML = stories.map((story, index) => `
      <article class="story-card ${index === 0 ? 'featured-story' : ''}" data-story-category="${escapeHtml(story.category)}">
        <div class="story-topline"><span>FICTIONAL DEMO</span><span>${escapeHtml(story.categoryLabel)}</span></div>
        <h3>${escapeHtml(story.title)}</h3>
        <p>${escapeHtml(story.summary)}</p>
        <div class="story-meta-row">
          <span class="story-status">${escapeHtml(story.status)}</span>
          <span>${escapeHtml(story.identity)}</span>
        </div>
        <div class="story-outcomes compact-outcomes">
          ${story.metrics.map(([label, value]) => `<span><strong>${escapeHtml(value)}</strong>${escapeHtml(label)}</span>`).join('')}
        </div>
        <button type="button" class="story-open" data-story-open="${escapeHtml(story.id)}">Open forged outcome <span aria-hidden="true">↗</span></button>
        <span class="evidence-badge">${escapeHtml(story.evidence)}</span>
      </article>
    `).join('');

    if (!document.querySelector('#story-detail-dialog')) {
      document.body.insertAdjacentHTML('beforeend', `
        <dialog class="story-dialog" id="story-detail-dialog" aria-labelledby="story-dialog-title">
          <div class="story-dialog-shell">
            <button type="button" class="dialog-close" data-story-close aria-label="Close story detail">×</button>
            <div id="story-dialog-content"></div>
          </div>
        </dialog>
      `);
    }

    if (!section.querySelector('#story-publication-model')) {
      section.insertAdjacentHTML('beforeend', `
        <aside class="publication-model" id="story-publication-model" aria-labelledby="publication-model-title">
          <div>
            <p class="eyebrow">PUBLICATION CONTROLS</p>
            <h3 id="publication-model-title">Private first. Published only with explicit approval.</h3>
          </div>
          <div class="publication-rules">
            <span>Anonymous option</span>
            <span>Sensitive figures can stay hidden</span>
            <span>Client-reported and system-measured evidence stay distinct</span>
            <span>Authorized removal and editing supported</span>
          </div>
          <p>This public library currently contains fictional demonstration stories only. No submitted idea is published automatically.</p>
        </aside>
      `);
    }
  }

  function renderDetail(story) {
    const content = document.querySelector('#story-dialog-content');
    if (!content) return;

    content.innerHTML = `
      <div class="story-detail-heading">
        <div>
          <p class="eyebrow">FORGED OUTCOME · FICTIONAL DEMO</p>
          <h2 id="story-dialog-title">${escapeHtml(story.title)}</h2>
          <p>${escapeHtml(story.summary)}</p>
        </div>
        <div class="story-detail-badges">
          <span>${escapeHtml(story.categoryLabel)}</span>
          <span>${escapeHtml(story.status)}</span>
          <span>${escapeHtml(story.identity)}</span>
        </div>
      </div>

      <div class="story-detail-grid">
        <section class="story-narrative" aria-label="Story narrative">
          <article><small>Original problem</small><p>${escapeHtml(story.problem)}</p></article>
          <article><small>Raw idea</small><p>${escapeHtml(story.idea)}</p></article>
          <article><small>What discovery clarified</small><p>${escapeHtml(story.clarified)}</p></article>
          <article><small>What was built</small><p>${escapeHtml(story.built)}</p></article>
          <article><small>Outcome</small><p>${escapeHtml(story.outcome)}</p></article>
          <blockquote>“${escapeHtml(story.quote)}”<cite>Fictional participant narrative</cite></blockquote>
        </section>

        <aside class="story-evidence-panel" aria-label="Outcome evidence and consent">
          <p class="eyebrow">OUTCOME EVIDENCE</p>
          <div class="story-metric-grid">
            ${story.metrics.map(([label, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`).join('')}
          </div>
          <p class="evidence-definition"><strong>${escapeHtml(story.evidence)}</strong><br />All figures and outcomes in this story are fictional demonstration data.</p>

          <p class="eyebrow">PUBLICATION CONSENT MODEL</p>
          <dl class="consent-list">
            ${Object.entries(story.consent).map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
          </dl>
        </aside>
      </div>

      <section class="story-timeline" aria-labelledby="story-timeline-title">
        <div class="story-timeline-heading">
          <p class="eyebrow">RAW IDEA → OUTCOME</p>
          <h3 id="story-timeline-title">Forge timeline</h3>
        </div>
        <ol>
          ${story.timeline.map(([stage, detail], index) => `
            <li class="${index < 4 ? 'complete' : index === 4 ? 'current' : 'outcome'}">
              <span>${String(index + 1).padStart(2, '0')}</span>
              <div><strong>${escapeHtml(stage)}</strong><p>${escapeHtml(detail)}</p></div>
            </li>
          `).join('')}
        </ol>
      </section>
    `;
  }

  function openStory(storyId, trigger) {
    const story = stories.find((candidate) => candidate.id === storyId);
    const dialog = document.querySelector('#story-detail-dialog');
    if (!story || !dialog) return;

    lastTrigger = trigger;
    renderDetail(story);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('[data-story-close]')?.focus();
  }

  function closeStory() {
    const dialog = document.querySelector('#story-detail-dialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    lastTrigger?.focus();
  }

  function wireEvents() {
    section.querySelectorAll('[data-story-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.storyFilter;
        section.querySelectorAll('[data-story-filter]').forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });

        let visible = 0;
        storyGrid.querySelectorAll('.story-card').forEach((card) => {
          const matches = filter === 'all' || card.dataset.storyCategory === filter;
          card.hidden = !matches;
          if (matches) visible += 1;
        });
        const count = section.querySelector('#story-result-count');
        if (count) count.textContent = `${visible} demo ${visible === 1 ? 'story' : 'stories'}`;
      });
    });

    storyGrid.querySelectorAll('[data-story-open]').forEach((button) => {
      button.addEventListener('click', () => openStory(button.dataset.storyOpen, button));
    });

    const dialog = document.querySelector('#story-detail-dialog');
    dialog?.querySelector('[data-story-close]')?.addEventListener('click', closeStory);
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) closeStory();
    });
    dialog?.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeStory();
    });
  }

  renderLibrary();
  wireEvents();
})();
