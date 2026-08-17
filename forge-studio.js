import {
  STAGES,
  advanceProject,
  calculateReadiness,
  createProject,
  getGate,
  getNextAction,
  makeId,
  normalizeProject,
  parseProjectImport,
  serializeProject,
  snapshotProject,
  toMarkdown,
} from './forge-studio-core.js';

const STORAGE = {
  consent: 'crohnoz-forge.studio-consent.v1',
  projects: 'crohnoz-forge.studio-projects.v1',
  active: 'crohnoz-forge.studio-active.v1',
};

const state = {
  projects: [],
  activeId: '',
  persist: false,
  tab: 'brief',
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const byId = (id) => document.getElementById(id);
const clean = (value = '') => String(value ?? '').trim();
const formatDate = (value) => value ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function readStorage(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function removeStorage(key) {
  try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

function loadState() {
  state.persist = readStorage(STORAGE.consent, 'false') === 'true';
  if (!state.persist) return;
  const stored = safeJson(readStorage(STORAGE.projects, '[]'), []);
  state.projects = Array.isArray(stored) ? stored.map(normalizeProject) : [];
  state.activeId = readStorage(STORAGE.active, '') || state.projects[0]?.id || '';
}

function persistState() {
  if (!state.persist) return true;
  const ok = writeStorage(STORAGE.projects, JSON.stringify(state.projects)) && writeStorage(STORAGE.active, state.activeId);
  if (!ok) toast('El navegador bloqueó el guardado local. Exporta el proyecto para conservarlo.', 'warning');
  return ok;
}

function activeProject() {
  return state.projects.find((project) => project.id === state.activeId) || null;
}

function replaceProject(project) {
  const normalized = normalizeProject({ ...project, updatedAt: new Date().toISOString() });
  const index = state.projects.findIndex((item) => item.id === normalized.id);
  if (index === -1) state.projects.unshift(normalized);
  else state.projects[index] = normalized;
  state.activeId = normalized.id;
  persistState();
  return normalized;
}

function toast(message, tone = 'neutral') {
  const node = byId('studio-toast');
  if (!node) return;
  node.textContent = message;
  node.dataset.tone = tone;
  node.classList.add('is-visible');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove('is-visible'), 2800);
}

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(label, className = '') {
  const element = node('button', className, label);
  element.type = 'button';
  return element;
}

function empty(container, text) {
  const item = node('p', 'studio-empty-copy', text);
  container.replaceChildren(item);
}

function setProjectField(field, value) {
  const project = activeProject();
  if (!project) return;
  replaceProject({ ...project, [field]: value });
  renderProjectList();
  renderOverview(false);
}

function renderProjectList() {
  const list = byId('project-list');
  const count = byId('project-count');
  if (!list || !count) return;
  const query = clean(byId('project-search')?.value).toLowerCase();
  const filtered = state.projects.filter((project) => !query || `${project.title} ${project.problem} ${project.outcome}`.toLowerCase().includes(query));
  count.textContent = String(state.projects.length);
  list.replaceChildren();
  if (!filtered.length) return empty(list, state.projects.length ? 'No hay coincidencias.' : 'Todavía no hay proyectos.');

  filtered.forEach((project) => {
    const item = button('', `project-item${project.id === state.activeId ? ' is-active' : ''}`);
    item.dataset.projectId = project.id;
    const top = node('span', 'project-item__top');
    top.append(node('strong', '', project.title), node('small', '', STAGES[project.stageIndex].label));
    const summary = node('span', 'project-item__summary', project.outcome || project.problem || 'Proyecto en preparación');
    const meta = node('span', 'project-item__meta');
    meta.append(node('i', '', `${calculateReadiness(project)}%`), node('small', '', `Actualizado ${formatDate(project.updatedAt)}`));
    item.append(top, summary, meta);
    item.addEventListener('click', () => {
      state.activeId = project.id;
      state.tab = 'brief';
      persistState();
      renderAll();
    });
    list.append(item);
  });
}

function renderStages(project) {
  const timeline = byId('stage-timeline');
  timeline.replaceChildren();
  STAGES.forEach((stage, index) => {
    const item = node('div', `stage-step${index < project.stageIndex ? ' is-done' : ''}${index === project.stageIndex ? ' is-current' : ''}`);
    const marker = node('span', 'stage-step__marker', index < project.stageIndex ? '✓' : String(index + 1));
    const copy = node('div', 'stage-step__copy');
    copy.append(node('strong', '', stage.label), node('small', '', stage.title));
    item.append(marker, copy);
    timeline.append(item);
  });
}

function renderGate(project) {
  const gate = getGate(project);
  const list = byId('gate-list');
  list.replaceChildren();
  gate.criteria.forEach((criterion) => {
    const item = node('li', criterion.complete ? 'is-complete' : '');
    item.append(node('span', '', criterion.complete ? '✓' : '○'), node('div'));
    item.lastChild.append(node('strong', '', criterion.label), node('small', '', criterion.detail));
    list.append(item);
  });
  byId('gate-progress').textContent = `${gate.completed}/${gate.total}`;
  byId('gate-label').textContent = gate.ready ? 'Gate listo' : 'Gate incompleto';
  byId('advance-stage').disabled = !gate.ready || project.stageIndex >= STAGES.length - 1;
  byId('advance-stage').textContent = project.stageIndex >= STAGES.length - 1 ? 'Lifecycle completo' : `Avanzar a ${STAGES[project.stageIndex + 1].label}`;
}

function renderOverview(refreshFields = true) {
  const project = activeProject();
  if (!project) return;
  const readiness = calculateReadiness(project);
  const next = getNextAction(project);
  byId('project-title').textContent = project.title;
  byId('project-stage').textContent = STAGES[project.stageIndex].label;
  byId('project-updated').textContent = `Actualizado ${formatDate(project.updatedAt)}`;
  byId('readiness-score').textContent = `${readiness}%`;
  byId('readiness-meter').style.setProperty('--progress', `${readiness}%`);
  byId('next-action-title').textContent = next.title;
  byId('next-action-detail').textContent = next.detail;
  byId('project-mode').textContent = state.persist ? 'Guardado local' : 'Sesión temporal';
  byId('project-mode').dataset.mode = state.persist ? 'saved' : 'temporary';
  renderStages(project);
  renderGate(project);

  if (refreshFields) {
    const map = {
      'brief-title': project.title,
      'brief-problem': project.problem,
      'brief-audience': project.audience,
      'brief-outcome': project.outcome,
      'brief-constraints': project.constraints,
      'prototype-notes': project.prototypeNotes,
      'outcome-notes': project.outcomeNotes,
    };
    Object.entries(map).forEach(([id, value]) => { const field = byId(id); if (field) field.value = value; });
  }
}

function renderStringList(containerId, items, onDelete) {
  const container = byId(containerId);
  container.replaceChildren();
  if (!items.length) return empty(container, 'Sin elementos todavía.');
  items.forEach((value, index) => {
    const item = node('div', 'studio-list-item');
    item.append(node('span', '', value));
    const remove = button('Eliminar', 'text-action text-action--danger');
    remove.addEventListener('click', () => onDelete(index));
    item.append(remove);
    container.append(item);
  });
}

function renderAssumptions(project) {
  const container = byId('assumption-list');
  container.replaceChildren();
  if (!project.assumptions.length) return empty(container, 'Convierte intuiciones en supuestos que puedas comprobar.');
  project.assumptions.forEach((assumption) => {
    const item = node('article', 'record-card');
    const body = node('div');
    body.append(node('strong', '', assumption.text), node('small', '', `Registrado ${formatDate(assumption.createdAt)}`));
    const controls = node('div', 'record-card__controls');
    const select = document.createElement('select');
    [['open','Abierto'],['validated','Validado'],['rejected','Rechazado']].forEach(([value, label]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = assumption.status === value; select.append(option);
    });
    select.addEventListener('change', () => {
      const updated = activeProject();
      updated.assumptions = updated.assumptions.map((item) => item.id === assumption.id ? { ...item, status: select.value } : item);
      replaceProject(updated); renderAll();
    });
    const remove = button('Eliminar', 'text-action text-action--danger');
    remove.addEventListener('click', () => {
      const updated = activeProject();
      updated.assumptions = updated.assumptions.filter((item) => item.id !== assumption.id);
      replaceProject(updated); renderAll();
    });
    controls.append(select, remove);
    item.append(body, controls);
    container.append(item);
  });
}

function renderEvidence(project) {
  const container = byId('evidence-list');
  container.replaceChildren();
  if (!project.evidence.length) return empty(container, 'Aún no hay evidencia. Registra datos, observaciones o entrevistas.');
  project.evidence.forEach((entry) => {
    const item = node('article', 'evidence-card');
    const badge = node('span', 'record-badge', entry.type || 'note');
    const copy = node('div');
    copy.append(node('strong', '', entry.text));
    if (entry.note) copy.append(node('p', '', entry.note));
    copy.append(node('small', '', formatDate(entry.createdAt)));
    const remove = button('Eliminar', 'text-action text-action--danger');
    remove.addEventListener('click', () => {
      const updated = activeProject(); updated.evidence = updated.evidence.filter((item) => item.id !== entry.id); replaceProject(updated); renderAll();
    });
    item.append(badge, copy, remove);
    container.append(item);
  });
}

function renderDecisions(project) {
  const container = byId('decision-list');
  container.replaceChildren();
  if (!project.decisions.length) return empty(container, 'Las decisiones importantes quedarán trazadas aquí.');
  project.decisions.forEach((entry) => {
    const item = node('article', 'decision-card');
    const copy = node('div');
    copy.append(node('strong', '', entry.text));
    if (entry.reason) copy.append(node('p', '', entry.reason));
    copy.append(node('small', '', formatDate(entry.createdAt)));
    const remove = button('Eliminar', 'text-action text-action--danger');
    remove.addEventListener('click', () => {
      const updated = activeProject(); updated.decisions = updated.decisions.filter((item) => item.id !== entry.id); replaceProject(updated); renderAll();
    });
    item.append(node('span', 'decision-mark', 'D'), copy, remove);
    container.append(item);
  });
}

function renderIterations(project) {
  const container = byId('iteration-list');
  container.replaceChildren();
  if (!project.iterations.length) return empty(container, 'Guarda un hito antes de cambios relevantes.');
  project.iterations.forEach((entry) => {
    const item = node('div', 'iteration-item');
    item.append(node('strong', '', entry.label), node('span', '', entry.summary), node('small', '', formatDate(entry.createdAt)));
    container.append(item);
  });
}

function renderHandoff(project) {
  const preview = byId('handoff-preview');
  preview.value = toMarkdown(project);
  byId('handoff-stage').textContent = STAGES[project.stageIndex].label;
  byId('handoff-readiness').textContent = `${calculateReadiness(project)} / 100`;
  byId('handoff-evidence').textContent = String(project.evidence.length);
  byId('handoff-decisions').textContent = String(project.decisions.length);
}

function renderPanels() {
  const project = activeProject();
  if (!project) return;
  $$('[data-tab]').forEach((tab) => {
    const active = tab.dataset.tab === state.tab;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  $$('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== state.tab; });
  renderAssumptions(project);
  renderEvidence(project);
  renderDecisions(project);
  renderIterations(project);
  renderStringList('mvp-list', project.mvp, (index) => { const updated = activeProject(); updated.mvp.splice(index, 1); replaceProject(updated); renderAll(); });
  renderStringList('metric-list', project.metrics, (index) => { const updated = activeProject(); updated.metrics.splice(index, 1); replaceProject(updated); renderAll(); });
  renderStringList('scenario-list', project.testScenarios, (index) => { const updated = activeProject(); updated.testScenarios.splice(index, 1); replaceProject(updated); renderAll(); });
  renderHandoff(project);
}

function renderAll() {
  const project = activeProject();
  const workspace = byId('project-workspace');
  const emptyState = byId('studio-empty');
  renderProjectList();
  if (!project) {
    workspace.hidden = true;
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  workspace.hidden = false;
  renderOverview(true);
  renderPanels();
}

function addTextItem(fieldId, key) {
  const input = byId(fieldId);
  const value = clean(input.value);
  if (!value) return input.focus();
  const project = activeProject();
  project[key] = [...project[key], value];
  input.value = '';
  replaceProject(project);
  renderAll();
}

function download(content, filename, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

async function copy(content) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(content);
  const area = document.createElement('textarea'); area.value = content; area.setAttribute('readonly', ''); document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
}

function slug(value) {
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'forge-project';
}

function createDemo() {
  return createProject({
    id: makeId('demo'),
    title: 'Demo · Trazabilidad de herramientas',
    problem: 'Las herramientas pasan entre bodega, cuadrillas y supervisores sin un registro único, por lo que se pierde tiempo buscando responsables y reconstruyendo movimientos.',
    audience: 'Bodega, cuadrillas y supervisores de terreno',
    outcome: 'Saber quién tiene cada herramienta, su estado y el último movimiento verificable.',
    constraints: 'Uso móvil en terreno, conectividad irregular y operación con códigos QR.',
    stageIndex: 2,
    assumptions: [
      { id: makeId('assumption'), text: 'Cada herramienta puede tener una identidad QR duradera.', status: 'validated', createdAt: new Date().toISOString() },
      { id: makeId('assumption'), text: 'Las cuadrillas aceptarán escanear al recibir y devolver.', status: 'open', createdAt: new Date().toISOString() },
    ],
    evidence: [{ id: makeId('evidence'), text: 'Supervisión reconstruye préstamos desde mensajes al cierre de semana.', note: 'Observación de proceso; requiere cuantificar frecuencia.', type: 'observación', createdAt: new Date().toISOString() }],
    decisions: [],
    mvp: ['Identidad QR por herramienta', 'Entrega y devolución', 'Estado y responsable actual', 'Historial de movimientos'],
    metrics: ['Tiempo para ubicar una herramienta', 'Movimientos sin responsable verificable'],
  });
}

function openProjectDialog() {
  const dialog = byId('project-dialog');
  byId('new-project-form').reset();
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
}

function bindEvents() {
  byId('new-project').addEventListener('click', openProjectDialog);
  byId('empty-new-project').addEventListener('click', openProjectDialog);
  byId('dialog-cancel').addEventListener('click', () => byId('project-dialog').close());
  byId('new-project-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const project = createProject({ title: data.get('title'), problem: data.get('problem'), audience: data.get('audience'), outcome: data.get('outcome') });
    state.projects.unshift(project); state.activeId = project.id; state.tab = 'brief'; persistState(); byId('project-dialog').close(); renderAll(); toast('Proyecto creado. Empieza completando el gate Raw.', 'success');
  });

  byId('load-demo').addEventListener('click', () => {
    const project = createDemo(); state.projects.unshift(project); state.activeId = project.id; state.tab = 'brief'; persistState(); renderAll(); toast('Demo cargada y claramente marcada como ficticia.', 'success');
  });

  byId('project-search').addEventListener('input', renderProjectList);
  byId('storage-consent').checked = state.persist;
  byId('storage-consent').addEventListener('change', (event) => {
    state.persist = event.currentTarget.checked;
    if (state.persist) {
      writeStorage(STORAGE.consent, 'true');
      persistState();
      toast('Guardado local activado para este navegador.', 'success');
    } else {
      removeStorage(STORAGE.consent); removeStorage(STORAGE.projects); removeStorage(STORAGE.active);
      toast('Guardado local desactivado y datos persistidos eliminados. La sesión actual sigue abierta.', 'warning');
    }
    renderAll();
  });

  $$('[data-tab]').forEach((tab) => tab.addEventListener('click', () => { state.tab = tab.dataset.tab; renderPanels(); }));

  [['brief-title','title'],['brief-problem','problem'],['brief-audience','audience'],['brief-outcome','outcome'],['brief-constraints','constraints'],['prototype-notes','prototypeNotes'],['outcome-notes','outcomeNotes']].forEach(([id, key]) => {
    byId(id).addEventListener('change', (event) => setProjectField(key, event.currentTarget.value));
  });

  byId('add-assumption').addEventListener('click', () => {
    const input = byId('assumption-input'); const value = clean(input.value); if (!value) return input.focus();
    const project = activeProject(); project.assumptions.push({ id: makeId('assumption'), text: value, status: 'open', createdAt: new Date().toISOString() }); input.value = ''; replaceProject(project); renderAll();
  });
  byId('add-mvp').addEventListener('click', () => addTextItem('mvp-input', 'mvp'));
  byId('add-metric').addEventListener('click', () => addTextItem('metric-input', 'metrics'));
  byId('add-scenario').addEventListener('click', () => addTextItem('scenario-input', 'testScenarios'));

  byId('add-evidence').addEventListener('click', () => {
    const text = clean(byId('evidence-input').value); if (!text) return byId('evidence-input').focus();
    const project = activeProject(); project.evidence.unshift({ id: makeId('evidence'), text, note: clean(byId('evidence-note').value), type: byId('evidence-type').value, createdAt: new Date().toISOString() });
    byId('evidence-input').value = ''; byId('evidence-note').value = ''; replaceProject(project); renderAll();
  });

  byId('add-decision').addEventListener('click', () => {
    const text = clean(byId('decision-input').value); if (!text) return byId('decision-input').focus();
    const project = activeProject(); project.decisions.unshift({ id: makeId('decision'), text, reason: clean(byId('decision-reason').value), createdAt: new Date().toISOString() });
    byId('decision-input').value = ''; byId('decision-reason').value = ''; replaceProject(project); renderAll();
  });

  byId('save-iteration').addEventListener('click', () => {
    const project = activeProject();
    const label = window.prompt('Nombre del hito o iteración:', `Hito ${project.iterations.length + 1}`);
    if (label === null) return;
    replaceProject(snapshotProject(project, label)); renderAll(); toast('Hito guardado en el historial del proyecto.', 'success');
  });

  byId('advance-stage').addEventListener('click', () => {
    const result = advanceProject(activeProject());
    if (!result.advanced) return toast('Completa el stage gate antes de avanzar.', 'warning');
    replaceProject(result.project); renderAll(); toast(`Proyecto avanzado a ${STAGES[result.project.stageIndex].label}.`, 'success');
  });

  byId('delete-project').addEventListener('click', () => {
    const project = activeProject(); if (!project || !window.confirm(`Eliminar “${project.title}” de esta sesión${state.persist ? ' y del almacenamiento local' : ''}?`)) return;
    state.projects = state.projects.filter((item) => item.id !== project.id); state.activeId = state.projects[0]?.id || ''; persistState(); renderAll(); toast('Proyecto eliminado.', 'warning');
  });

  byId('copy-handoff').addEventListener('click', async () => { try { await copy(toMarkdown(activeProject())); toast('Handoff copiado.', 'success'); } catch { toast('No pude copiar. Usa la descarga.', 'warning'); } });
  byId('download-md').addEventListener('click', () => { const project = activeProject(); download(toMarkdown(project), `${slug(project.title)}.md`, 'text/markdown;charset=utf-8'); });
  byId('download-json').addEventListener('click', () => { const project = activeProject(); download(serializeProject(project), `${slug(project.title)}.forge.json`, 'application/json;charset=utf-8'); });

  byId('import-file').addEventListener('change', async (event) => {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    if (!file) return; if (file.size > 500000) return toast('El archivo supera el máximo de 500 KB.', 'warning');
    try {
      const project = parseProjectImport(await file.text()); project.id = makeId('project'); project.title = `${project.title} · importado`; state.projects.unshift(project); state.activeId = project.id; state.tab = 'brief'; persistState(); renderAll(); toast('Proyecto importado correctamente.', 'success');
    } catch (error) { toast(error.message || 'No pude importar el archivo.', 'warning'); }
  });

  byId('clear-local').addEventListener('click', () => {
    if (!window.confirm('¿Borrar todos los proyectos de esta sesión y del almacenamiento local?')) return;
    state.projects = []; state.activeId = ''; removeStorage(STORAGE.projects); removeStorage(STORAGE.active); renderAll(); toast('Workspace limpio.', 'warning');
  });
}

loadState();
bindEvents();
renderAll();
