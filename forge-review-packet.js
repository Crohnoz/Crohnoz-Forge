(() => {
  const packetCore = window.CrohnozForgeReviewPacketCore;
  const workspaceCore = window.CrohnozForgeWorkspaceCore;
  const blueprint = document.querySelector('#blueprint');
  if (!packetCore || !workspaceCore || !blueprint) return;

  let currentPacket = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function text(selector) {
    return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function textList(selector) {
    return [...document.querySelectorAll(selector)]
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  function selectedRefinements() {
    return [...document.querySelectorAll('[data-refine].selected')]
      .map((button) => button.dataset.refine)
      .filter(Boolean);
  }

  function selectedVisualDirection() {
    const preview = document.querySelector('#preview-device');
    return ['precision-grid', 'warm-service', 'field-utility']
      .find((direction) => preview?.classList.contains(`preview-direction-${direction}`)) || null;
  }

  function captureCurrentSnapshot() {
    return workspaceCore.normalizeSnapshot({
      product: {
        idea: document.querySelector('#idea-input')?.value || '',
        audience: document.querySelector('#audience-input')?.value || '',
        format: document.querySelector('#format-input')?.value || '',
        goal: document.querySelector('#goal-input')?.value || '',
        currentMethod: document.querySelector('#current-method-input')?.value || '',
        refinements: selectedRefinements(),
        visualDirection: selectedVisualDirection(),
      },
      blueprint: {
        name: text('#product-name'),
        tagline: text('#product-tagline'),
        summary: text('#blueprint-summary'),
        users: textList('#user-list li'),
        features: textList('#feature-list li'),
        assumptions: textList('#assumption-list li'),
        workflow: textList('#workflow-list .workflow-step strong'),
        validationQuestions: textList('#validation-questions li'),
        risks: textList('#risk-register article, .risk-register article, [data-strategy-risk]'),
        deliveryPhases: textList('#delivery-phases article, .delivery-phase, [data-delivery-phase]'),
      },
      review: {
        privacyReviewed: Boolean(document.querySelector('#review-privacy')?.checked),
        accessibilityReviewed: Boolean(document.querySelector('#review-accessibility')?.checked),
        evidenceReviewed: Boolean(document.querySelector('#review-evidence')?.checked),
        ownerAssigned: Boolean(document.querySelector('#review-owner')?.checked),
        notes: document.querySelector('#workspace-notes')?.value || '',
      },
      metadata: { source: 'review-packet-builder', appVersion: '0.8.0' },
    });
  }

  function selectedSections() {
    return [...document.querySelectorAll('[data-packet-section]:checked')]
      .map((input) => input.value);
  }

  function optionsFromUI() {
    const mode = document.querySelector('#packet-mode').value;
    return {
      mode,
      audience: document.querySelector('#packet-audience').value,
      sections: selectedSections(),
      includeRawProblem: mode !== 'public-safe' && document.querySelector('#packet-raw-problem').checked,
      includeReviewNotes: mode === 'internal' && document.querySelector('#packet-review-notes').checked,
    };
  }

  function ensureUI() {
    if (document.querySelector('#forge-review-packet')) return;
    const anchor = document.querySelector('#forge-privacy-center') || document.querySelector('#forge-workspace');
    const markup = `
      <section class="forge-review-packet" id="forge-review-packet" aria-labelledby="packet-title">
        <div class="packet-heading">
          <div>
            <p class="eyebrow">PORTABLE REVIEW PACKET</p>
            <h3 id="packet-title">Turn the blueprint into an accountable review artifact</h3>
            <p>Generate a structured packet for internal review, a client workshop, or implementation handoff. Analytics data is never included.</p>
          </div>
          <span id="packet-mode-badge">Internal review draft</span>
        </div>

        <div class="packet-builder-grid">
          <article class="packet-controls" aria-labelledby="packet-controls-title">
            <div><span>Packet configuration</span><h4 id="packet-controls-title">Choose audience and disclosure level</h4></div>
            <label>Disclosure mode
              <select id="packet-mode">
                <option value="internal">Internal</option>
                <option value="client">Client review</option>
                <option value="public-safe">Public-safe draft</option>
              </select>
            </label>
            <label>Intended audience
              <select id="packet-audience">
                <option value="internal-review">Internal review</option>
                <option value="client-workshop">Client workshop</option>
                <option value="implementation-handoff">Implementation handoff</option>
              </select>
            </label>

            <fieldset>
              <legend>Included sections</legend>
              <div class="packet-section-options">
                ${[
                  ['scope', 'Scope and non-goals'],
                  ['decisions', 'Current decisions'],
                  ['risks', 'Risk register'],
                  ['validation', 'Validation plan'],
                  ['delivery', 'Delivery phases and gates'],
                  ['evidence', 'Evidence controls'],
                  ['signoff', 'Sign-off matrix'],
                ].map(([value, label]) => `<label><input type="checkbox" data-packet-section value="${value}" checked /> ${label}</label>`).join('')}
              </div>
            </fieldset>

            <label class="packet-check"><input type="checkbox" id="packet-raw-problem" checked /> Include raw problem statement</label>
            <label class="packet-check"><input type="checkbox" id="packet-review-notes" /> Include local review notes</label>
            <div class="packet-disclosure-note" id="packet-disclosure-note">
              <strong>Internal mode</strong>
              <p>May include the raw problem statement. Review notes remain excluded unless explicitly selected.</p>
            </div>
            <button type="button" class="button button-primary" id="packet-generate">Generate review packet</button>
          </article>

          <article class="packet-readiness" aria-labelledby="packet-readiness-title">
            <div><span>Review gates</span><h4 id="packet-readiness-title">Current decision readiness</h4></div>
            <div id="packet-gate-summary"><p>Generate a packet to evaluate the current gates.</p></div>
            <div class="packet-boundary">
              <strong>Hard boundary</strong>
              <p>A generated packet does not establish approval, feasibility, compliance, deployment readiness, or publication consent.</p>
            </div>
          </article>
        </div>

        <div class="packet-output" id="packet-output" hidden aria-live="polite">
          <div class="packet-output-heading">
            <div><span>Generated artifact</span><h4 id="packet-output-title">Forge Review Packet</h4></div>
            <div class="packet-output-actions">
              <button type="button" id="packet-copy">Copy Markdown</button>
              <button type="button" id="packet-export-md">Export .md</button>
              <button type="button" id="packet-export-json">Export JSON</button>
            </div>
          </div>
          <div class="packet-summary-strip" id="packet-summary-strip"></div>
          <div class="packet-preview" id="packet-preview"></div>
        </div>
        <p id="packet-status" class="packet-status" role="status" aria-live="polite"></p>
      </section>
    `;

    if (anchor) anchor.insertAdjacentHTML('afterend', markup);
    else blueprint.insertAdjacentHTML('beforeend', markup);
  }

  function disclosureContent(mode) {
    if (mode === 'public-safe') {
      return {
        badge: 'Public-safe draft; approval still required',
        title: 'Public-safe mode',
        copy: 'Removes the raw problem, current method, and internal review notes. It does not grant publication consent.',
      };
    }
    if (mode === 'client') {
      return {
        badge: 'Client review draft',
        title: 'Client review mode',
        copy: 'Can include the raw problem but always excludes internal review notes.',
      };
    }
    return {
      badge: 'Internal review draft',
      title: 'Internal mode',
      copy: 'May include the raw problem statement. Review notes remain excluded unless explicitly selected.',
    };
  }

  function updateDisclosureUI() {
    const mode = document.querySelector('#packet-mode').value;
    const content = disclosureContent(mode);
    document.querySelector('#packet-mode-badge').textContent = content.badge;
    document.querySelector('#packet-disclosure-note').innerHTML = `<strong>${escapeHtml(content.title)}</strong><p>${escapeHtml(content.copy)}</p>`;
    const rawProblem = document.querySelector('#packet-raw-problem');
    const notes = document.querySelector('#packet-review-notes');
    rawProblem.disabled = mode === 'public-safe';
    if (mode === 'public-safe') rawProblem.checked = false;
    notes.disabled = mode !== 'internal';
    if (mode !== 'internal') notes.checked = false;
  }

  function statusClass(status) {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'ready-for-review') return 'review';
    return 'pending';
  }

  function renderGates(gates) {
    const confirmed = gates.filter((gate) => gate.status === 'confirmed').length;
    const reviewable = gates.filter((gate) => gate.status === 'ready-for-review').length;
    document.querySelector('#packet-gate-summary').innerHTML = `
      <div class="packet-gate-counts">
        <article><strong>${confirmed}</strong><span>confirmed</span></article>
        <article><strong>${reviewable}</strong><span>ready for review</span></article>
        <article><strong>${gates.length - confirmed - reviewable}</strong><span>pending</span></article>
      </div>
      <ul>${gates.map((gate) => `
        <li class="${statusClass(gate.status)}"><span></span><div><strong>${escapeHtml(gate.label)}</strong><small>${escapeHtml(gate.status)}</small></div></li>
      `).join('')}</ul>
    `;
  }

  function renderList(title, items, ordered = false) {
    if (!items?.length) return '';
    const tag = ordered ? 'ol' : 'ul';
    return `<section><h5>${escapeHtml(title)}</h5><${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}></section>`;
  }

  function renderPacket(packet) {
    const sections = packet.sections;
    document.querySelector('#packet-output').hidden = false;
    document.querySelector('#packet-output-title').textContent = `${packet.product.name} — Forge Review Packet`;
    document.querySelector('#packet-summary-strip').innerHTML = `
      <div><small>Mode</small><strong>${escapeHtml(packet.mode)}</strong></div>
      <div><small>Audience</small><strong>${escapeHtml(packet.audience)}</strong></div>
      <div><small>Classification</small><strong>${escapeHtml(packet.confidentiality)}</strong></div>
      <div><small>Schema</small><strong>v${packet.schemaVersion}</strong></div>
    `;

    const signoff = sections.signoff?.length ? `
      <section class="packet-signoff"><h5>Sign-off matrix</h5>
        <div>${sections.signoff.map((item) => `
          <article><div><strong>${escapeHtml(item.role)}</strong><span class="${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.responsibility)}</p></article>
        `).join('')}</div>
      </section>
    ` : '';

    document.querySelector('#packet-preview').innerHTML = `
      <header>
        <p>${escapeHtml(packet.sourceBoundary)}</p>
        <h4>${escapeHtml(packet.product.tagline || packet.product.summary)}</h4>
        ${packet.product.rawProblem ? `<blockquote>${escapeHtml(packet.product.rawProblem)}</blockquote>` : '<div class="packet-redacted">Raw problem statement excluded from this packet.</div>'}
      </header>
      <div class="packet-context-grid">
        <div><small>Audience</small><strong>${escapeHtml(packet.product.audience || 'Not defined')}</strong></div>
        <div><small>Format</small><strong>${escapeHtml(packet.product.format || 'Not defined')}</strong></div>
        <div><small>Outcome</small><strong>${escapeHtml(packet.product.outcome || 'Not defined')}</strong></div>
        <div><small>Refinements</small><strong>${escapeHtml(packet.product.refinements.join(', ') || 'None selected')}</strong></div>
      </div>
      <div class="packet-sections">
        ${sections.scope ? renderList('First-release features', sections.scope.firstReleaseFeatures) + renderList('Critical workflow', sections.scope.criticalWorkflow, true) + renderList('Non-goals', sections.scope.nonGoals) : ''}
        ${sections.decisions ? renderList('Current decisions', sections.decisions) : ''}
        ${sections.risks ? renderList('Risk register', sections.risks) : ''}
        ${sections.validation ? renderList('Open assumptions', sections.validation.assumptions) + renderList('Validation questions', sections.validation.questions) + `<aside><strong>Evidence boundary</strong><p>${escapeHtml(sections.validation.evidenceBoundary)}</p></aside>` : ''}
        ${sections.delivery ? renderList('Delivery phases', sections.delivery.phases, true) : ''}
        ${sections.evidence ? `<section><h5>Evidence and publication controls</h5><p>${escapeHtml(sections.evidence.status)}</p>${renderList('Restrictions', sections.evidence.restrictions)}</section>` : ''}
        ${signoff}
        ${packet.reviewNotes ? `<section class="packet-internal-notes"><h5>Internal review notes</h5><p>${escapeHtml(packet.reviewNotes)}</p></section>` : ''}
      </div>
      <footer><strong>Next decision</strong><p>${escapeHtml(packet.nextDecision)}</p><small>${escapeHtml(packet.disclaimer)}</small></footer>
    `;
  }

  function setStatus(message, tone = 'neutral') {
    const status = document.querySelector('#packet-status');
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function generatePacket() {
    if (blueprint.hidden) {
      setStatus('Create a Forge Blueprint before generating a review packet.', 'error');
      return;
    }
    const sections = selectedSections();
    if (!sections.length) {
      setStatus('Select at least one packet section.', 'error');
      return;
    }
    currentPacket = packetCore.buildReviewPacket(captureCurrentSnapshot(), optionsFromUI());
    renderPacket(currentPacket);
    renderGates(currentPacket.sections.delivery?.gates || packetCore.buildGates(captureCurrentSnapshot()));
    setStatus('Review packet generated in memory. It has not been saved, uploaded, or published.', 'success');
    document.querySelector('#packet-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function safeFilename(extension) {
    const base = (currentPacket?.product.name || 'crohnoz-forge-review-packet')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    return `${base || 'crohnoz-forge-review-packet'}-${currentPacket?.mode || 'draft'}-${new Date().toISOString().slice(0, 10)}.${extension}`;
  }

  function download(content, type, extension) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename(extension);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function copyMarkdown() {
    if (!currentPacket) {
      setStatus('Generate a packet before copying it.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(packetCore.packetToMarkdown(currentPacket));
      setStatus('Review packet Markdown copied.', 'success');
    } catch {
      setStatus('Clipboard access is unavailable in this browser.', 'error');
    }
  }

  ensureUI();
  updateDisclosureUI();
  document.querySelector('#packet-mode').addEventListener('change', updateDisclosureUI);
  document.querySelector('#packet-generate').addEventListener('click', generatePacket);
  document.querySelector('#packet-copy').addEventListener('click', copyMarkdown);
  document.querySelector('#packet-export-md').addEventListener('click', () => {
    if (!currentPacket) return setStatus('Generate a packet before exporting it.', 'error');
    download(packetCore.packetToMarkdown(currentPacket), 'text/markdown;charset=utf-8', 'md');
    setStatus('Markdown review packet exported locally.', 'success');
  });
  document.querySelector('#packet-export-json').addEventListener('click', () => {
    if (!currentPacket) return setStatus('Generate a packet before exporting it.', 'error');
    download(packetCore.serializePacket(currentPacket), 'application/json;charset=utf-8', 'json');
    setStatus('Structured review packet exported locally.', 'success');
  });
})();
