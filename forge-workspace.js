(() => {
  const core = window.CrohnozForgeWorkspaceCore;
  const blueprint = document.querySelector('#blueprint');
  const ideaInput = document.querySelector('#idea-input');
  const audienceInput = document.querySelector('#audience-input');
  const formatInput = document.querySelector('#format-input');
  const forgeButton = document.querySelector('#forge-button');

  if (!core || !blueprint || !ideaInput || !audienceInput || !formatInput || !forgeButton) return;

  const STORAGE_KEY = 'crohnoz-forge:workspace:v1';
  const HISTORY_KEY = 'crohnoz-forge:workspace-history:v1';
  const PREFERENCES_KEY = 'crohnoz-forge:workspace-preferences:v1';
  const MAX_HISTORY = 5;

  let lastSnapshot = null;
  let autosaveTimer = null;
  let restoreInProgress = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function storageAvailable() {
    try {
      const probe = '__crohnoz_forge_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  function readJSON(key, fallback) {
    if (!storageAvailable()) return fallback;
    try {
      return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    if (!storageAvailable()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeStored(key) {
    if (!storageAvailable()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage can become unavailable at runtime. The interface reports the final state.
    }
  }

  function text(selector) {
    return document.querySelector(selector)?.textContent?.trim() || '';
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
    const direction = ['precision-grid', 'warm-service', 'field-utility']
      .find((key) => preview?.classList.contains(`preview-direction-${key}`));
    return direction || null;
  }

  function reviewState() {
    return {
      privacyReviewed: Boolean(document.querySelector('#review-privacy')?.checked),
      accessibilityReviewed: Boolean(document.querySelector('#review-accessibility')?.checked),
      evidenceReviewed: Boolean(document.querySelector('#review-evidence')?.checked),
      ownerAssigned: Boolean(document.querySelector('#review-owner')?.checked),
      notes: document.querySelector('#workspace-notes')?.value || '',
    };
  }

  function captureSnapshot() {
    const now = new Date().toISOString();
    const createdAt = lastSnapshot?.createdAt || now;

    const snapshot = core.normalizeSnapshot({
      createdAt,
      updatedAt: now,
      product: {
        idea: ideaInput.value,
        audience: audienceInput.value,
        format: formatInput.value,
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
      review: reviewState(),
      metadata: {
        source: 'browser-workspace',
        appVersion: '0.7.0',
      },
    });

    lastSnapshot = snapshot;
    return snapshot;
  }

  function ensureUI() {
    if (document.querySelector('#forge-workspace')) return;

    const anchor = blueprint.querySelector('.blueprint-header, .blueprint-heading, .blueprint-title') || blueprint.firstElementChild;
    const workspaceMarkup = `
      <section class="forge-workspace" id="forge-workspace" aria-labelledby="workspace-title">
        <div class="workspace-heading">
          <div>
            <p class="eyebrow">LOCAL BLUEPRINT WORKSPACE</p>
            <h3 id="workspace-title">Keep, review, and share this blueprint</h3>
            <p>Nothing in this workspace is sent to a server. Local saving is optional and remains in this browser.</p>
          </div>
          <div class="workspace-state" id="workspace-state">
            <span data-workspace-state="unsaved">Not saved</span>
            <small id="workspace-state-detail">Exporting does not publish the idea.</small>
          </div>
        </div>

        <div class="workspace-actions" aria-label="Blueprint workspace actions">
          <button type="button" class="button button-secondary" id="workspace-save">Save locally</button>
          <button type="button" class="button button-ghost" id="workspace-export">Export JSON</button>
          <button type="button" class="button button-ghost" id="workspace-copy">Copy summary</button>
          <button type="button" class="button button-ghost" id="workspace-import">Import blueprint</button>
          <input type="file" id="workspace-import-file" accept="application/json,.json" hidden />
        </div>

        <div class="workspace-options">
          <label class="workspace-switch">
            <input type="checkbox" id="workspace-autosave" />
            <span><strong>Enable local autosave</strong><small>Opt-in. Saves only after this control is enabled.</small></span>
          </label>
          <button type="button" class="workspace-danger" id="workspace-clear">Delete local workspace data</button>
        </div>

        <div class="workspace-restore" id="workspace-restore" hidden>
          <div><strong>A saved local blueprint is available</strong><small id="workspace-restore-detail"></small></div>
          <button type="button" id="workspace-restore-button">Restore it</button>
          <button type="button" id="workspace-dismiss-restore">Dismiss</button>
        </div>

        <div class="workspace-review-grid">
          <article class="review-readiness" aria-labelledby="review-readiness-title">
            <div class="readiness-heading">
              <div><span>Human review readiness</span><strong id="review-readiness-score">0%</strong></div>
              <p id="review-readiness-title">Still exploratory</p>
            </div>
            <div class="readiness-track" aria-hidden="true"><span id="review-readiness-bar"></span></div>
            <ul id="review-readiness-list"></ul>
          </article>

          <article class="review-checks" aria-labelledby="review-checks-title">
            <div>
              <span>Required human checks</span>
              <h4 id="review-checks-title">Confirm before review or implementation</h4>
            </div>
            <label><input type="checkbox" id="review-privacy" data-review-check="privacy" /> Privacy and data handling reviewed</label>
            <label><input type="checkbox" id="review-accessibility" data-review-check="accessibility" /> Accessibility requirements reviewed</label>
            <label><input type="checkbox" id="review-evidence" data-review-check="evidence" /> Claims and evidence labels reviewed</label>
            <label><input type="checkbox" id="review-owner" data-review-check="owner" /> Owner assigned to the next experiment</label>
            <label class="workspace-notes-label">Review notes
              <textarea id="workspace-notes" maxlength="1200" rows="4" placeholder="Decisions, unresolved questions, or the next review owner"></textarea>
            </label>
          </article>
        </div>

        <div class="workspace-history" aria-labelledby="workspace-history-title">
          <div><span>Local version history</span><h4 id="workspace-history-title">Last five explicit saves</h4></div>
          <div id="workspace-history-list"><p>No local versions saved.</p></div>
        </div>

        <p class="workspace-status" id="workspace-status" role="status" aria-live="polite"></p>
      </section>
    `;

    if (anchor) anchor.insertAdjacentHTML('afterend', workspaceMarkup);
    else blueprint.insertAdjacentHTML('afterbegin', workspaceMarkup);
  }

  function setStatus(message, tone = 'neutral') {
    const status = document.querySelector('#workspace-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function setSavedState(snapshot, label = 'Saved locally') {
    const state = document.querySelector('#workspace-state span');
    const detail = document.querySelector('#workspace-state-detail');
    if (!state || !detail) return;
    state.dataset.workspaceState = 'saved';
    state.textContent = label;
    detail.textContent = `Updated ${new Date(snapshot.updatedAt).toLocaleString()}`;
  }

  function setDirtyState() {
    if (restoreInProgress) return;
    const state = document.querySelector('#workspace-state span');
    const detail = document.querySelector('#workspace-state-detail');
    if (!state || !detail) return;
    state.dataset.workspaceState = 'unsaved';
    state.textContent = 'Changes not saved';
    detail.textContent = document.querySelector('#workspace-autosave')?.checked
      ? 'Autosave will capture these changes shortly.'
      : 'Local persistence remains disabled.';
    scheduleAutosave();
    renderReadiness();
  }

  function pushHistory(snapshot) {
    const history = readJSON(HISTORY_KEY, []);
    const entry = {
      checksum: snapshot.checksum,
      updatedAt: snapshot.updatedAt,
      name: snapshot.blueprint.name || 'Untitled blueprint',
      ideaExcerpt: snapshot.product.idea.slice(0, 100),
      snapshot,
    };
    const deduplicated = [entry, ...history.filter((item) => item?.checksum !== entry.checksum)].slice(0, MAX_HISTORY);
    writeJSON(HISTORY_KEY, deduplicated);
    renderHistory();
  }

  function saveLocally({ automatic = false } = {}) {
    const snapshot = captureSnapshot();
    if (!writeJSON(STORAGE_KEY, snapshot)) {
      setStatus('Local storage is unavailable. Export the blueprint instead.', 'error');
      return false;
    }
    pushHistory(snapshot);
    setSavedState(snapshot, automatic ? 'Autosaved locally' : 'Saved locally');
    setStatus(automatic ? 'Blueprint autosaved in this browser.' : 'Blueprint saved in this browser only.', 'success');
    window.dispatchEvent(new CustomEvent('forge:workspace-event', { detail: { type: 'workspace_saved', automatic } }));
    return true;
  }

  function scheduleAutosave() {
    window.clearTimeout(autosaveTimer);
    if (!document.querySelector('#workspace-autosave')?.checked || blueprint.hidden) return;
    autosaveTimer = window.setTimeout(() => saveLocally({ automatic: true }), 900);
  }

  function safeFilename(snapshot, extension) {
    const base = (snapshot.blueprint.name || 'crohnoz-forge-blueprint')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'crohnoz-forge-blueprint';
    return `${base}-${new Date().toISOString().slice(0, 10)}.${extension}`;
  }

  function downloadText(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportSnapshot() {
    const snapshot = captureSnapshot();
    downloadText(core.serializeSnapshot(snapshot), safeFilename(snapshot, 'json'), 'application/json;charset=utf-8');
    setStatus('Blueprint exported as a portable JSON file. It was not uploaded or published.', 'success');
    window.dispatchEvent(new CustomEvent('forge:workspace-event', { detail: { type: 'workspace_exported' } }));
  }

  async function copySummary() {
    const snapshot = captureSnapshot();
    const summary = core.buildPlainTextSummary(snapshot);
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('A plain-text blueprint summary was copied.', 'success');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      setStatus(copied ? 'A plain-text blueprint summary was copied.' : 'Copy was unavailable in this browser.', copied ? 'success' : 'error');
    }
  }

  function waitForBlueprint(timeout = 6000) {
    return new Promise((resolve, reject) => {
      if (!blueprint.hidden) {
        resolve();
        return;
      }
      const started = Date.now();
      const observer = new MutationObserver(() => {
        if (!blueprint.hidden) {
          observer.disconnect();
          resolve();
        } else if (Date.now() - started > timeout) {
          observer.disconnect();
          reject(new Error('Blueprint rendering timed out.'));
        }
      });
      observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
      window.setTimeout(() => {
        if (!blueprint.hidden) return;
        observer.disconnect();
        reject(new Error('Blueprint rendering timed out.'));
      }, timeout);
    });
  }

  function setSelectValue(selector, value) {
    const select = document.querySelector(selector);
    if (!select || !value) return;
    const optionExists = [...select.options].some((option) => option.value === value);
    if (optionExists) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function clearRefinements() {
    document.querySelectorAll('[data-refine].selected').forEach((button) => button.click());
  }

  async function restoreSnapshot(snapshot, source = 'import') {
    const validation = core.validateSnapshot(snapshot);
    if (!validation.valid) {
      setStatus(validation.errors.join(' '), 'error');
      return false;
    }

    restoreInProgress = true;
    const safe = validation.snapshot;
    ideaInput.value = safe.product.idea;
    ideaInput.dispatchEvent(new Event('input', { bubbles: true }));
    setSelectValue('#audience-input', safe.product.audience);
    setSelectValue('#format-input', safe.product.format);
    setSelectValue('#goal-input', safe.product.goal);
    setSelectValue('#current-method-input', safe.product.currentMethod);
    clearRefinements();
    forgeButton.click();

    try {
      await waitForBlueprint();
      await new Promise((resolve) => window.setTimeout(resolve, 160));

      safe.product.refinements.forEach((key) => {
        const button = document.querySelector(`[data-refine="${CSS.escape(key)}"]`);
        if (button && !button.classList.contains('selected')) button.click();
      });

      if (safe.product.visualDirection && safe.product.refinements.includes('visual-alt')) {
        const order = ['precision-grid', 'warm-service', 'field-utility'];
        const targetIndex = order.indexOf(safe.product.visualDirection);
        const visualButton = document.querySelector('[data-refine="visual-alt"]');
        for (let index = 0; visualButton && index < targetIndex; index += 1) visualButton.click();
      }

      document.querySelector('#review-privacy').checked = safe.review.privacyReviewed;
      document.querySelector('#review-accessibility').checked = safe.review.accessibilityReviewed;
      document.querySelector('#review-evidence').checked = safe.review.evidenceReviewed;
      document.querySelector('#review-owner').checked = safe.review.ownerAssigned;
      document.querySelector('#workspace-notes').value = safe.review.notes;
      lastSnapshot = safe;
      renderReadiness();
      setSavedState(safe, source === 'local' ? 'Restored from local save' : 'Imported blueprint');
      setStatus(source === 'local'
        ? 'Local blueprint restored. Review current assumptions before continuing.'
        : 'Blueprint imported and regenerated from validated inputs.', 'success');
      window.dispatchEvent(new CustomEvent('forge:workspace-event', {
        detail: { type: 'workspace_imported', schemaVersion: safe.schemaVersion, source },
      }));
      return true;
    } catch (error) {
      setStatus(error.message || 'The blueprint could not be restored.', 'error');
      return false;
    } finally {
      restoreInProgress = false;
    }
  }

  async function importFile(file) {
    if (!file) return;
    if (file.size > 300000) {
      setStatus('The selected blueprint file is too large.', 'error');
      return;
    }
    const result = core.parseSnapshot(await file.text());
    if (!result.valid) {
      setStatus(result.errors.join(' '), 'error');
      return;
    }
    await restoreSnapshot(result.snapshot, 'import');
  }

  function renderReadiness() {
    if (blueprint.hidden) return;
    const readiness = core.calculateReadiness(captureSnapshot());
    document.querySelector('#review-readiness-score').textContent = `${readiness.score}%`;
    document.querySelector('#review-readiness-title').textContent = readiness.classification;
    document.querySelector('#review-readiness-bar').style.width = `${readiness.score}%`;
    document.querySelector('#review-readiness-list').innerHTML = readiness.checks.map((check) => `
      <li class="${check.complete ? 'complete' : ''}">
        <span aria-hidden="true">${check.complete ? '✓' : '○'}</span>
        <span>${escapeHtml(check.label)}</span>
      </li>
    `).join('');
  }

  function renderHistory() {
    const container = document.querySelector('#workspace-history-list');
    if (!container) return;
    const history = readJSON(HISTORY_KEY, []);
    if (!history.length) {
      container.innerHTML = '<p>No local versions saved.</p>';
      return;
    }
    container.innerHTML = history.slice(0, MAX_HISTORY).map((entry, index) => `
      <article>
        <div>
          <strong>${escapeHtml(entry.name || 'Untitled blueprint')}</strong>
          <small>${escapeHtml(new Date(entry.updatedAt).toLocaleString())} · ${escapeHtml(entry.checksum || '')}</small>
          <p>${escapeHtml(entry.ideaExcerpt || '')}</p>
        </div>
        <button type="button" data-history-restore="${index}">Restore</button>
      </article>
    `).join('');
  }

  function showRestoreOffer() {
    const stored = readJSON(STORAGE_KEY, null);
    const panel = document.querySelector('#workspace-restore');
    if (!stored || !panel) return;
    const validation = core.validateSnapshot(stored);
    if (!validation.valid) {
      removeStored(STORAGE_KEY);
      return;
    }
    panel.hidden = false;
    panel.dataset.available = 'true';
    document.querySelector('#workspace-restore-detail').textContent = `${validation.snapshot.blueprint.name || 'Untitled blueprint'} · saved ${new Date(validation.snapshot.updatedAt).toLocaleString()}`;
  }

  function clearWorkspaceData() {
    removeStored(STORAGE_KEY);
    removeStored(HISTORY_KEY);
    writeJSON(PREFERENCES_KEY, { autosave: false });
    document.querySelector('#workspace-autosave').checked = false;
    document.querySelector('#workspace-restore').hidden = true;
    lastSnapshot = null;
    renderHistory();
    const state = document.querySelector('#workspace-state span');
    state.dataset.workspaceState = 'unsaved';
    state.textContent = 'Not saved';
    document.querySelector('#workspace-state-detail').textContent = 'Local workspace data was deleted.';
    setStatus('Local blueprint saves and version history were deleted. Analytics data is controlled separately.', 'success');
  }

  function bindEvents() {
    document.querySelector('#workspace-save').addEventListener('click', () => saveLocally());
    document.querySelector('#workspace-export').addEventListener('click', exportSnapshot);
    document.querySelector('#workspace-copy').addEventListener('click', copySummary);
    document.querySelector('#workspace-import').addEventListener('click', () => document.querySelector('#workspace-import-file').click());
    document.querySelector('#workspace-import-file').addEventListener('change', async (event) => {
      await importFile(event.target.files?.[0]);
      event.target.value = '';
    });
    document.querySelector('#workspace-clear').addEventListener('click', clearWorkspaceData);
    document.querySelector('#workspace-autosave').addEventListener('change', (event) => {
      writeJSON(PREFERENCES_KEY, { autosave: event.target.checked });
      setStatus(event.target.checked
        ? 'Local autosave enabled. No network transmission is used.'
        : 'Local autosave disabled. Existing local saves remain until deleted.', 'neutral');
      if (event.target.checked) saveLocally({ automatic: true });
    });
    document.querySelector('#workspace-restore-button').addEventListener('click', async () => {
      const stored = readJSON(STORAGE_KEY, null);
      if (stored) await restoreSnapshot(stored, 'local');
      document.querySelector('#workspace-restore').hidden = true;
    });
    document.querySelector('#workspace-dismiss-restore').addEventListener('click', () => {
      document.querySelector('#workspace-restore').hidden = true;
    });

    document.querySelector('#forge-workspace').addEventListener('input', (event) => {
      if (event.target.matches('[data-review-check], #workspace-notes')) {
        setDirtyState();
        if (event.target.matches('[data-review-check]')) {
          window.dispatchEvent(new CustomEvent('forge:workspace-event', {
            detail: {
              type: 'review_check_changed',
              check: event.target.dataset.reviewCheck,
              complete: event.target.checked,
            },
          }));
        }
      }
    });

    document.querySelector('#workspace-history-list').addEventListener('click', async (event) => {
      const button = event.target.closest('[data-history-restore]');
      if (!button) return;
      const history = readJSON(HISTORY_KEY, []);
      const entry = history[Number(button.dataset.historyRestore)];
      if (entry?.snapshot) await restoreSnapshot(entry.snapshot, 'local');
    });

    const appRoot = document.querySelector('main') || document.body;
    appRoot.addEventListener('input', (event) => {
      if (event.target.closest('#forge-workspace')) return;
      if (event.target.matches('input, textarea, select')) setDirtyState();
    });
    appRoot.addEventListener('click', (event) => {
      if (event.target.closest('[data-refine], [data-preview], #new-angle')) {
        window.setTimeout(setDirtyState, 100);
      }
    });

    window.addEventListener('forge:refinement-change', () => setDirtyState());
  }

  ensureUI();
  bindEvents();

  const preferences = readJSON(PREFERENCES_KEY, { autosave: false });
  document.querySelector('#workspace-autosave').checked = Boolean(preferences.autosave);
  renderHistory();
  showRestoreOffer();

  const observer = new MutationObserver(() => {
    if (!blueprint.hidden) {
      window.setTimeout(renderReadiness, 120);
      window.setTimeout(renderReadiness, 500);
    }
  });
  observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
})();
