(function forgeWorkspace() {
  const Core = window.ForgeWorkspaceCore;
  const blueprint = document.querySelector('#blueprint');
  if (!Core || !blueprint) return;

  const KEYS = {
    snapshots: 'crohnoz-forge.snapshots.v1',
    events: 'crohnoz-forge.events.v1',
    consent: 'crohnoz-forge.local-consent.v1',
  };
  let currentId = '';
  let lastTrigger = null;

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function read(key, fallback) {
    try { return safeParse(localStorage.getItem(key), fallback); } catch { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }

  function hasConsent() { return read(KEYS.consent, false) === true; }

  function text(selector) { return document.querySelector(selector)?.textContent?.trim() || ''; }
  function list(selector) { return [...document.querySelectorAll(selector)].map((item) => item.textContent.trim()).filter(Boolean); }

  function collectBlueprint() {
    const idea = document.querySelector('#idea-input')?.value?.trim() || '';
    const refinements = [
      ...document.querySelectorAll('[data-refine].selected, [data-refinement].selected'),
    ].map((button) => button.dataset.refine || button.dataset.refinement).filter(Boolean);
    return Core.normalizeBlueprint({
      id: currentId || `forge-${Date.now()}`,
      title: text('#product-name') || 'Untitled Forge Blueprint',
      idea,
      audience: document.querySelector('#audience-input')?.value || '',
      format: document.querySelector('#format-input')?.value || '',
      tagline: text('#product-tagline'),
      summary: text('#blueprint-summary'),
      users: list('#user-list li'),
      features: list('#feature-list li'),
      assumptions: list('#assumption-list li'),
      workflow: list('#workflow-list strong'),
      refinements,
      visualDirection: document.querySelector('#product-preview')?.dataset.visualDirection || '',
      strategicSummary: text('#strategy-problem') || text('.strategy-section'),
      savedAt: Date.now(),
    });
  }

  function record(type, metadata = {}) {
    const event = Core.createEvent(type, metadata);
    const events = Core.addEvent(read(KEYS.events, []), event);
    write(KEYS.events, events);
    renderAnalytics();
  }

  function notify(message, tone = 'neutral') {
    const status = document.querySelector('#workspace-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function saveCurrent() {
    if (!hasConsent()) {
      document.querySelector('#local-consent')?.focus();
      notify('Enable local storage before saving. Nothing has been stored.', 'warning');
      return;
    }
    const data = collectBlueprint();
    if (!data.idea) {
      notify('Create a blueprint before saving it.', 'warning');
      return;
    }
    currentId = data.id;
    const success = write(KEYS.snapshots, Core.addSnapshot(read(KEYS.snapshots, []), data));
    if (!success) {
      notify('The browser blocked local storage. Export the blueprint instead.', 'warning');
      return;
    }
    record('workspace_saved', { format: data.format, refinements: data.refinements.length });
    renderSnapshots();
    notify('Blueprint saved only in this browser.', 'success');
  }

  function applyBlueprint(data) {
    currentId = data.id;
    const idea = document.querySelector('#idea-input');
    if (idea) {
      idea.value = data.idea;
      idea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const audience = document.querySelector('#audience-input');
    const format = document.querySelector('#format-input');
    if (audience && [...audience.options].some((option) => option.value === data.audience)) audience.value = data.audience;
    if (format && [...format.options].some((option) => option.value === data.format)) format.value = data.format;

    document.querySelectorAll('[data-refine], [data-refinement]').forEach((button) => {
      const key = button.dataset.refine || button.dataset.refinement;
      const selected = data.refinements.includes(key);
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    document.querySelector('#forge-button')?.click();
    window.setTimeout(() => {
      data.refinements.forEach((key) => {
        const button = document.querySelector(`[data-refine="${CSS.escape(key)}"], [data-refinement="${CSS.escape(key)}"]`);
        if (button && !button.classList.contains('selected')) button.click();
      });
      notify(`Loaded “${data.title}” into the Forge.`, 'success');
    }, 2800);
  }

  function exportJson() {
    const data = collectBlueprint();
    if (!data.idea) return notify('Create a blueprint before exporting it.', 'warning');
    download(`${JSON.stringify(data, null, 2)}\n`, `${slug(data.title)}.forge.json`, 'application/json');
    record('workspace_exported', { type: 'json' });
    notify('Portable JSON blueprint exported.', 'success');
  }

  function exportMarkdown() {
    const data = collectBlueprint();
    if (!data.idea) return notify('Create a blueprint before exporting it.', 'warning');
    download(Core.toMarkdown(data), `${slug(data.title)}.md`, 'text/markdown');
    record('workspace_exported', { type: 'markdown' });
    notify('Human-readable Markdown blueprint exported.', 'success');
  }

  function slug(value) {
    return String(value || 'forge-blueprint').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'forge-blueprint';
  }

  async function importFile(file) {
    if (!file || file.size > 300000) return notify('Import rejected: the file must be JSON under 300 KB.', 'warning');
    try {
      const parsed = JSON.parse(await file.text());
      const result = Core.validateImport(parsed);
      if (!result.valid) return notify(`Import rejected: ${result.errors.join(' ')}`, 'warning');
      applyBlueprint(result.blueprint);
      record('workspace_imported', { version: result.blueprint.version });
    } catch {
      notify('Import rejected: invalid JSON file.', 'warning');
    }
  }

  function renderSnapshots() {
    const container = document.querySelector('#workspace-snapshots');
    if (!container) return;
    const snapshots = read(KEYS.snapshots, []);
    container.innerHTML = snapshots.length ? snapshots.map((item) => `
      <article class="workspace-snapshot">
        <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.format || 'Exploratory')} · ${new Date(item.savedAt).toLocaleString()}</small></div>
        <div class="workspace-snapshot-actions">
          <button type="button" data-load-snapshot="${escapeHtml(item.id)}">Load</button>
          <button type="button" data-delete-snapshot="${escapeHtml(item.id)}">Delete</button>
        </div>
      </article>`).join('') : '<p class="workspace-empty">No local blueprints saved.</p>';
  }

  function renderAnalytics() {
    const container = document.querySelector('#workspace-analytics');
    if (!container) return;
    const summary = Core.summarizeEvents(read(KEYS.events, []));
    const labels = {
      blueprint_created: 'Blueprints created', refinement_changed: 'Refinements changed',
      intelligence_changed: 'Simulator changes', story_opened: 'Stories opened',
      workspace_saved: 'Local saves', workspace_exported: 'Exports', workspace_imported: 'Imports',
    };
    container.innerHTML = Object.entries(labels).map(([key, label]) => `<div><strong>${summary[key] || 0}</strong><span>${label}</span></div>`).join('');
  }

  function clearWorkspace() {
    if (!window.confirm('Delete all locally saved Forge blueprints and local usage counters from this browser?')) return;
    try {
      localStorage.removeItem(KEYS.snapshots);
      localStorage.removeItem(KEYS.events);
      localStorage.removeItem(KEYS.consent);
    } catch { /* storage may be blocked */ }
    currentId = '';
    document.querySelector('#local-consent').checked = false;
    renderSnapshots();
    renderAnalytics();
    notify('Local Forge data cleared from this browser.', 'success');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  const section = document.createElement('section');
  section.className = 'forge-workspace section-shell';
  section.id = 'forge-workspace';
  section.innerHTML = `
    <div class="workspace-heading">
      <div><p class="eyebrow">PRIVATE LOCAL WORKSPACE</p><h2>Keep, move, and review your blueprint</h2><p>Optional browser-only storage. No account, tracking vendor, or automatic upload.</p></div>
      <span class="workspace-local-badge">This device only</span>
    </div>
    <div class="workspace-privacy">
      <label><input id="local-consent" type="checkbox"> Allow Crohnoz Forge to store blueprints and anonymous usage counters in this browser.</label>
      <p>Raw ideas are never included in usage counters. Clearing browser data removes saved work.</p>
    </div>
    <div class="workspace-actions" aria-label="Blueprint workspace actions">
      <button type="button" id="workspace-save">Save locally</button>
      <button type="button" id="workspace-export-json">Export JSON</button>
      <button type="button" id="workspace-export-md">Export Markdown</button>
      <label class="workspace-import">Import JSON<input id="workspace-import" type="file" accept="application/json,.json"></label>
      <button type="button" id="workspace-clear" class="workspace-danger">Clear local data</button>
    </div>
    <p id="workspace-status" class="workspace-status" aria-live="polite">Local storage is off by default.</p>
    <div class="workspace-grid">
      <section><h3>Saved blueprints</h3><div id="workspace-snapshots"></div></section>
      <section><h3>Private usage summary</h3><div id="workspace-analytics" class="workspace-analytics"></div><p class="workspace-note">Counts stay in this browser and contain no idea text, names, emails, messages, or uploaded files.</p></section>
    </div>`;

  blueprint.insertAdjacentElement('afterend', section);

  const consent = document.querySelector('#local-consent');
  consent.checked = hasConsent();
  consent.addEventListener('change', () => {
    write(KEYS.consent, consent.checked);
    notify(consent.checked ? 'Local saving enabled for this browser.' : 'Local saving disabled. Existing saves remain until cleared.', 'success');
  });
  document.querySelector('#workspace-save').addEventListener('click', saveCurrent);
  document.querySelector('#workspace-export-json').addEventListener('click', exportJson);
  document.querySelector('#workspace-export-md').addEventListener('click', exportMarkdown);
  document.querySelector('#workspace-import').addEventListener('change', (event) => {
    importFile(event.target.files?.[0]);
    event.target.value = '';
  });
  document.querySelector('#workspace-clear').addEventListener('click', clearWorkspace);
  document.querySelector('#workspace-snapshots').addEventListener('click', (event) => {
    const load = event.target.closest('[data-load-snapshot]');
    const remove = event.target.closest('[data-delete-snapshot]');
    const snapshots = read(KEYS.snapshots, []);
    if (load) {
      lastTrigger = load;
      const item = snapshots.find((snapshot) => snapshot.id === load.dataset.loadSnapshot);
      if (item) applyBlueprint(item);
    }
    if (remove) {
      write(KEYS.snapshots, Core.removeSnapshot(snapshots, remove.dataset.deleteSnapshot));
      renderSnapshots();
      notify('Local blueprint deleted.', 'success');
    }
  });

  document.addEventListener('forge:refinement-change', (event) => record('refinement_changed', { refinement: event.detail?.refinement || 'unknown', selected: Boolean(event.detail?.selected) }));
  document.querySelector('#forge-button')?.addEventListener('click', () => window.setTimeout(() => {
    if (!document.querySelector('#blueprint')?.hidden) record('blueprint_created', { format: document.querySelector('#format-input')?.value || '' });
  }, 2600));
  document.querySelector('#operations-slider')?.addEventListener('change', () => record('intelligence_changed', { control: 'operations' }));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-story-id], .story-card')) record('story_opened', { source: 'stories' });
  });
  window.addEventListener('storage', (event) => {
    if (Object.values(KEYS).includes(event.key)) { renderSnapshots(); renderAnalytics(); }
  });

  renderSnapshots();
  renderAnalytics();
}());
