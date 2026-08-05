(() => {
  const core = window.CrohnozForgeAnalyticsCore;
  const blueprint = document.querySelector('#blueprint');
  if (!core || !blueprint) return;

  const STORAGE_KEY = 'crohnoz-forge:analytics:v1';
  let state = loadState();
  let simulatorTimer = null;
  let forgePending = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function storageAvailable() {
    try {
      const probe = '__crohnoz_analytics_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  function loadState() {
    if (!storageAvailable()) return core.clearState(false);
    try {
      const loaded = core.parseState(localStorage.getItem(STORAGE_KEY) || '');
      if (core.isExpired(loaded)) return core.clearState(loaded.consent);
      if (loaded.consent) loaded.sessionCount = Math.min(100000, loaded.sessionCount + 1);
      return loaded;
    } catch {
      return core.clearState(false);
    }
  }

  function persistState() {
    if (!storageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEY, core.serializeState(state));
      return true;
    } catch {
      return false;
    }
  }

  function removeState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage availability is reflected in the interface status.
    }
  }

  function record(type, metadata = {}) {
    const nextState = core.recordEvent(state, type, metadata);
    if (nextState === state) return;
    state = nextState;
    if (state.consent) persistState();
    renderSummary();
  }

  function ensureUI() {
    if (document.querySelector('#forge-privacy-center')) return;
    const workspace = document.querySelector('#forge-workspace');
    const markup = `
      <section class="forge-privacy-center" id="forge-privacy-center" aria-labelledby="privacy-center-title">
        <div class="privacy-center-heading">
          <div>
            <p class="eyebrow">PRIVATE ANALYTICS CENTER</p>
            <h3 id="privacy-center-title">Understand interaction without collecting the idea</h3>
            <p>Analytics are off by default, stored only in this browser, retained for 30 days, and never include idea text, names, messages, or contact information.</p>
          </div>
          <span class="privacy-network-badge">No network transmission</span>
        </div>

        <div class="privacy-consent-card">
          <label class="privacy-consent-switch">
            <input type="checkbox" id="analytics-consent" />
            <span aria-hidden="true"></span>
            <strong>Enable local product analytics</strong>
          </label>
          <p id="analytics-consent-copy">No interaction events are being stored.</p>
        </div>

        <div class="privacy-metrics" id="privacy-metrics" aria-live="polite">
          <article><small>Stored events</small><strong id="analytics-total">0</strong><span>aggregate counts only</span></article>
          <article><small>Local sessions</small><strong id="analytics-sessions">0</strong><span>in this browser dataset</span></article>
          <article><small>Most used preview</small><strong id="analytics-preview">—</strong><span>screen identifier only</span></article>
          <article><small>Retention</small><strong>30 days</strong><span>reset after expiry</span></article>
        </div>

        <div class="privacy-detail-grid">
          <article class="analytics-breakdown">
            <div><span>Event inventory</span><h4>What has been counted</h4></div>
            <div id="analytics-event-list"><p>No stored events.</p></div>
          </article>

          <article class="privacy-dictionary">
            <div><span>Data minimization</span><h4>Allowed and forbidden data</h4></div>
            <dl>
              <div><dt>Stored</dt><dd>Event type, aggregate count, selected preview identifier, refinement count, broad fictional story category.</dd></div>
              <div><dt>Never stored</dt><dd>Idea text, problem description, organization, names, email, phone, messages, review notes, imported blueprint content.</dd></div>
              <div><dt>Destination</dt><dd>Browser localStorage only after explicit opt-in. No remote endpoint exists in this implementation.</dd></div>
              <div><dt>Control</dt><dd>Disable collection, export the aggregate dataset, or delete it immediately.</dd></div>
            </dl>
          </article>
        </div>

        <details class="privacy-event-dictionary">
          <summary>View the exact event allowlist</summary>
          <div>${core.ALLOWED_EVENTS.map((eventName) => `<code>${escapeHtml(eventName)}</code>`).join('')}</div>
        </details>

        <div class="privacy-actions">
          <button type="button" class="button button-ghost" id="analytics-export">Export aggregate data</button>
          <button type="button" class="button button-ghost" id="analytics-copy-report">Copy privacy report</button>
          <button type="button" class="workspace-danger" id="analytics-clear">Delete analytics data</button>
        </div>
        <p id="analytics-status" class="analytics-status" role="status" aria-live="polite"></p>
      </section>
    `;

    if (workspace) workspace.insertAdjacentHTML('afterend', markup);
    else blueprint.insertAdjacentHTML('beforeend', markup);
  }

  function setStatus(message, tone = 'neutral') {
    const status = document.querySelector('#analytics-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function formatEventName(value) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function renderSummary() {
    const summary = core.summarize(state);
    const consent = document.querySelector('#analytics-consent');
    if (!consent) return;
    consent.checked = summary.consent;
    document.querySelector('#analytics-consent-copy').textContent = summary.consent
      ? 'Local aggregate counting is active. No idea content is read or stored.'
      : 'No interaction events are being stored.';
    document.querySelector('#analytics-total').textContent = summary.totalEvents.toLocaleString();
    document.querySelector('#analytics-sessions').textContent = state.sessionCount.toLocaleString();
    document.querySelector('#analytics-preview').textContent = summary.topPreview?.[0] || '—';

    const entries = Object.entries(summary.eventCounts).sort((left, right) => right[1] - left[1]);
    const list = document.querySelector('#analytics-event-list');
    list.innerHTML = entries.length
      ? entries.map(([eventName, count]) => `
          <div>
            <span>${escapeHtml(formatEventName(eventName))}</span>
            <strong>${Number(count).toLocaleString()}</strong>
          </div>
        `).join('')
      : '<p>No stored events.</p>';

    document.querySelector('#forge-privacy-center').classList.toggle('analytics-enabled', summary.consent);
  }

  function safeDownload(content, filename) {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportData() {
    if (!state.consent && core.summarize(state).totalEvents === 0) {
      setStatus('There is no local analytics dataset to export.', 'neutral');
      return;
    }
    safeDownload(core.serializeState(state), `crohnoz-forge-local-analytics-${new Date().toISOString().slice(0, 10)}.json`);
    setStatus('Aggregate local analytics exported. No blueprint content is included.', 'success');
  }

  async function copyPrivacyReport() {
    const summary = core.summarize(state);
    const report = [
      'Crohnoz Forge local analytics privacy report',
      '',
      `Collection enabled: ${summary.consent ? 'yes' : 'no'}`,
      `Stored aggregate events: ${summary.totalEvents}`,
      `Retention: ${summary.retentionDays} days`,
      `Storage: ${summary.storage}`,
      `Network transmission: ${summary.networkTransmission ? 'yes' : 'no'}`,
      '',
      'Excluded data: idea text, descriptions, names, organizations, contact information, messages, notes, and blueprint content.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      setStatus('Privacy report copied.', 'success');
    } catch {
      setStatus('Clipboard access is unavailable in this browser.', 'error');
    }
  }

  function clearAnalytics() {
    const consent = state.consent;
    state = core.clearState(consent);
    removeState();
    if (consent) persistState();
    renderSummary();
    setStatus('All local analytics counts were deleted.', 'success');
  }

  function bindConsent() {
    document.querySelector('#analytics-consent').addEventListener('change', (event) => {
      state = core.setConsent(state, event.target.checked);
      if (state.consent) {
        persistState();
        setStatus('Local analytics enabled. Only allowlisted aggregate events will be stored.', 'success');
      } else {
        persistState();
        setStatus('Local analytics disabled. Existing counts remain until you delete them.', 'neutral');
      }
      renderSummary();
    });
  }

  function broadStoryCategory(target) {
    const card = target.closest('[data-story-category], .story-card');
    const category = card?.dataset.storyCategory || 'other';
    return String(category).toLowerCase().replace(/[^a-z-]/g, '').slice(0, 30) || 'other';
  }

  function bindProductEvents() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest('#forge-button')) {
        forgePending = true;
        record('forge_started');
      }

      const sample = target.closest('[data-sample]');
      if (sample) {
        const samples = [...document.querySelectorAll('[data-sample]')];
        record('sample_selected', { sample: `sample-${samples.indexOf(sample) + 1}` });
      }

      const preview = target.closest('[data-preview]');
      if (preview) record('preview_opened', { screen: preview.dataset.preview });

      const storyTrigger = target.closest('[data-story-id], [data-open-story], .story-card button, .story-card a');
      if (storyTrigger) record('story_opened', { category: broadStoryCategory(storyTrigger), outcomeType: 'fictional-demo' });

      const dashboardFilter = target.closest('[data-dashboard-filter]');
      if (dashboardFilter) {
        record('dashboard_filtered', {
          status: dashboardFilter.dataset.status || dashboardFilter.dataset.dashboardFilter || 'changed',
          privacy: dashboardFilter.dataset.privacy || 'unchanged',
        });
      }
    });

    document.addEventListener('change', (event) => {
      if (event.target.matches('#dashboard-status-filter, #opportunity-status-filter')) {
        record('dashboard_filtered', { status: event.target.value, privacy: 'unchanged' });
      }
      if (event.target.matches('#dashboard-privacy-filter, #opportunity-privacy-filter')) {
        record('dashboard_filtered', { status: 'unchanged', privacy: event.target.value });
      }
    });

    window.addEventListener('forge:refinement-change', (event) => {
      record('refinement_changed', {
        count: Array.isArray(event.detail?.refinements) ? event.detail.refinements.length : 0,
        visualDirection: event.detail?.visualDirection || 'none',
      });
    });

    window.addEventListener('forge:workspace-event', (event) => {
      const detail = event.detail || {};
      if (!core.ALLOWED_EVENTS.includes(detail.type)) return;
      record(detail.type, {
        schemaVersion: detail.schemaVersion,
        check: detail.check,
        complete: detail.complete,
      });
    });

    document.addEventListener('input', (event) => {
      if (!event.target.closest('#forge-intelligence')) return;
      clearTimeout(simulatorTimer);
      simulatorTimer = setTimeout(() => {
        const complexity = document.querySelector('#intelligence-complexity')?.textContent?.trim() || 'unknown';
        record('simulator_changed', { complexity, preset: 'custom' });
      }, 700);
    });

    const observer = new MutationObserver(() => {
      if (forgePending && !blueprint.hidden) {
        forgePending = false;
        record('forge_completed');
      }
    });
    observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
  }

  ensureUI();
  bindConsent();
  bindProductEvents();
  document.querySelector('#analytics-export').addEventListener('click', exportData);
  document.querySelector('#analytics-copy-report').addEventListener('click', copyPrivacyReport);
  document.querySelector('#analytics-clear').addEventListener('click', clearAnalytics);
  renderSummary();

  if (state.consent) persistState();
})();
