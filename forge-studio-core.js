export const STAGES = [
  { id: 'raw', label: 'Raw', title: 'Materia prima', description: 'Define el problema, las personas y el resultado que importa.' },
  { id: 'discovery', label: 'Discovery', title: 'Descubrimiento', description: 'Convierte intuiciones en supuestos y reúne evidencia.' },
  { id: 'blueprint', label: 'Blueprint', title: 'Plano', description: 'Recorta el MVP y define cómo medir si funciona.' },
  { id: 'prototype', label: 'Prototype', title: 'Prototipo', description: 'Representa el recorrido crítico antes de construir completo.' },
  { id: 'testing', label: 'Testing', title: 'Prueba', description: 'Contrasta el concepto con uso, observaciones y decisiones.' },
  { id: 'outcome', label: 'Outcome', title: 'Resultado', description: 'Documenta lo aprendido, lo entregado y la siguiente apuesta.' },
];

const clean = (value = '') => String(value ?? '').trim().replace(/\s+/g, ' ');
const uniqueStrings = (items = []) => [...new Set(items.map(clean).filter(Boolean))];
const normalizeStatus = (value) => ['open', 'validated', 'rejected'].includes(value) ? value : 'open';
const isoNow = () => new Date().toISOString();

export function makeId(prefix = 'forge') {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function createProject(input = {}) {
  const now = isoNow();
  return normalizeProject({
    id: makeId('project'),
    title: input.title || 'Nuevo proyecto',
    problem: input.problem || '',
    audience: input.audience || '',
    outcome: input.outcome || '',
    constraints: input.constraints || '',
    stageIndex: 0,
    assumptions: [],
    evidence: [],
    decisions: [],
    mvp: [],
    metrics: [],
    testScenarios: [],
    prototypeNotes: '',
    outcomeNotes: '',
    iterations: [],
    createdAt: now,
    updatedAt: now,
    ...input,
  });
}

export function normalizeProject(input = {}) {
  const stageIndex = Math.max(0, Math.min(STAGES.length - 1, Number(input.stageIndex) || 0));
  const normalizeEntry = (entry = {}) => ({
    id: clean(entry.id) || makeId('entry'),
    text: clean(entry.text || entry.label),
    note: clean(entry.note),
    reason: clean(entry.reason),
    type: clean(entry.type) || 'note',
    status: normalizeStatus(entry.status),
    createdAt: entry.createdAt || isoNow(),
  });
  return {
    id: clean(input.id) || makeId('project'),
    title: clean(input.title) || 'Proyecto sin título',
    problem: clean(input.problem),
    audience: clean(input.audience),
    outcome: clean(input.outcome),
    constraints: clean(input.constraints),
    stageIndex,
    assumptions: Array.isArray(input.assumptions) ? input.assumptions.map(normalizeEntry).filter((item) => item.text) : [],
    evidence: Array.isArray(input.evidence) ? input.evidence.map(normalizeEntry).filter((item) => item.text) : [],
    decisions: Array.isArray(input.decisions) ? input.decisions.map(normalizeEntry).filter((item) => item.text) : [],
    mvp: uniqueStrings(input.mvp),
    metrics: uniqueStrings(input.metrics),
    testScenarios: uniqueStrings(input.testScenarios),
    prototypeNotes: clean(input.prototypeNotes),
    outcomeNotes: clean(input.outcomeNotes),
    iterations: Array.isArray(input.iterations) ? input.iterations.map((item) => ({
      id: clean(item.id) || makeId('iteration'),
      label: clean(item.label) || 'Iteración',
      summary: clean(item.summary),
      createdAt: item.createdAt || isoNow(),
    })) : [],
    createdAt: input.createdAt || isoNow(),
    updatedAt: input.updatedAt || isoNow(),
  };
}

function criterion(id, label, complete, detail) {
  return { id, label, complete: Boolean(complete), detail };
}

export function getGate(projectInput, stageIndex = null) {
  const project = normalizeProject(projectInput);
  const index = stageIndex === null ? project.stageIndex : Math.max(0, Math.min(STAGES.length - 1, Number(stageIndex) || 0));
  const stage = STAGES[index];
  let criteria = [];

  if (stage.id === 'raw') {
    criteria = [
      criterion('problem', 'Problema suficientemente descrito', project.problem.length >= 30, 'Describe la situación actual y por qué importa.'),
      criterion('audience', 'Personas afectadas identificadas', project.audience.length >= 3, 'Define quién vive o administra el problema.'),
      criterion('outcome', 'Resultado esperado observable', project.outcome.length >= 15, 'Expresa qué debería cambiar si la solución sirve.'),
    ];
  } else if (stage.id === 'discovery') {
    criteria = [
      criterion('assumptions', 'Al menos 2 supuestos explícitos', project.assumptions.length >= 2, 'Haz visible lo que todavía estás suponiendo.'),
      criterion('evidence', 'Al menos 1 evidencia registrada', project.evidence.length >= 1, 'Añade una observación, entrevista, dato o restricción verificada.'),
      criterion('validated', 'Existe un supuesto revisado', project.assumptions.some((item) => item.status !== 'open'), 'Marca un supuesto como validado o rechazado.'),
    ];
  } else if (stage.id === 'blueprint') {
    criteria = [
      criterion('mvp', 'MVP recortado a 3+ capacidades', project.mvp.length >= 3, 'Define qué sí entra en la primera versión.'),
      criterion('metric', 'Existe al menos 1 métrica', project.metrics.length >= 1, 'Define una señal que permita decidir si el MVP funciona.'),
      criterion('constraint', 'Restricciones documentadas', project.constraints.length >= 8, 'Registra límites técnicos, operativos, regulatorios o de negocio.'),
    ];
  } else if (stage.id === 'prototype') {
    criteria = [
      criterion('prototype', 'Notas del prototipo documentadas', project.prototypeNotes.length >= 30, 'Describe el recorrido crítico o qué representa el prototipo.'),
      criterion('scenario', 'Existe al menos 1 escenario de prueba', project.testScenarios.length >= 1, 'Define una tarea concreta que una persona debería poder completar.'),
    ];
  } else if (stage.id === 'testing') {
    criteria = [
      criterion('evidence', '2+ evidencias acumuladas', project.evidence.length >= 2, 'Registra observaciones obtenidas durante la prueba.'),
      criterion('decision', 'Existe al menos 1 decisión', project.decisions.length >= 1, 'Convierte la evidencia en una decisión explícita.'),
      criterion('iteration', 'Existe al menos 1 iteración', project.iterations.length >= 1, 'Guarda un hito antes de cambiar el alcance o el flujo.'),
    ];
  } else {
    criteria = [
      criterion('outcome', 'Resultado y aprendizaje documentados', project.outcomeNotes.length >= 30, 'Resume qué se logró, qué no y qué conviene hacer después.'),
      criterion('decision', 'Decisión final registrada', project.decisions.length >= 1, 'Deja trazabilidad de la siguiente apuesta o cierre.'),
    ];
  }

  const completed = criteria.filter((item) => item.complete).length;
  return {
    stage,
    index,
    criteria,
    completed,
    total: criteria.length,
    ready: completed === criteria.length,
    progress: Math.round((completed / Math.max(1, criteria.length)) * 100),
  };
}

export function calculateReadiness(projectInput) {
  const project = normalizeProject(projectInput);
  let score = 0;
  score += Math.min(40, (project.problem.length >= 30 ? 16 : 0) + (project.audience ? 8 : 0) + (project.outcome.length >= 15 ? 12 : 0) + (project.constraints ? 4 : 0));
  score += Math.min(20, Math.min(project.assumptions.length, 3) * 4 + Math.min(project.evidence.length, 2) * 4 + (project.assumptions.some((item) => item.status !== 'open') ? 4 : 0));
  score += Math.min(20, Math.min(project.mvp.length, 4) * 3 + Math.min(project.metrics.length, 2) * 4);
  score += Math.min(20, (project.prototypeNotes.length >= 30 ? 6 : 0) + Math.min(project.testScenarios.length, 2) * 3 + Math.min(project.decisions.length, 2) * 3 + (project.outcomeNotes.length >= 30 ? 2 : 0));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getNextAction(projectInput) {
  const project = normalizeProject(projectInput);
  const gate = getGate(project);
  const pending = gate.criteria.find((item) => !item.complete);
  if (pending) return { title: pending.label, detail: pending.detail, stage: gate.stage.label };
  if (project.stageIndex < STAGES.length - 1) {
    const next = STAGES[project.stageIndex + 1];
    return { title: `Avanzar a ${next.label}`, detail: next.description, stage: gate.stage.label };
  }
  return { title: 'Preparar handoff', detail: 'Exporta el paquete del proyecto y deja registrada la siguiente decisión.', stage: gate.stage.label };
}

export function advanceProject(projectInput) {
  const project = normalizeProject(projectInput);
  const gate = getGate(project);
  if (!gate.ready) return { advanced: false, project, gate };
  if (project.stageIndex >= STAGES.length - 1) return { advanced: false, project, gate, complete: true };
  const updated = normalizeProject({ ...project, stageIndex: project.stageIndex + 1, updatedAt: isoNow() });
  return { advanced: true, project: updated, gate: getGate(updated) };
}

export function snapshotProject(projectInput, label = 'Hito') {
  const project = normalizeProject(projectInput);
  const snapshot = {
    id: makeId('iteration'),
    label: clean(label) || `Hito ${project.iterations.length + 1}`,
    summary: `${STAGES[project.stageIndex].label}: ${project.outcome || project.problem || project.title}`,
    createdAt: isoNow(),
  };
  return normalizeProject({ ...project, iterations: [snapshot, ...project.iterations], updatedAt: isoNow() });
}

export function toMarkdown(projectInput) {
  const project = normalizeProject(projectInput);
  const gate = getGate(project);
  const readiness = calculateReadiness(project);
  const rows = (items, mapper = (item) => item) => items.length ? items.map((item) => `- ${mapper(item)}`).join('\n') : '- Sin registrar';
  return `# ${project.title}\n\n` +
    `**Crohnoz Forge Studio** · Etapa: ${gate.stage.label} · Readiness: ${readiness}/100\n\n` +
    `## Problema\n${project.problem || 'Sin registrar'}\n\n` +
    `## Personas\n${project.audience || 'Sin registrar'}\n\n` +
    `## Resultado esperado\n${project.outcome || 'Sin registrar'}\n\n` +
    `## Restricciones\n${project.constraints || 'Sin registrar'}\n\n` +
    `## MVP\n${rows(project.mvp)}\n\n` +
    `## Métricas\n${rows(project.metrics)}\n\n` +
    `## Supuestos\n${rows(project.assumptions, (item) => `[${item.status}] ${item.text}`)}\n\n` +
    `## Evidencia\n${rows(project.evidence, (item) => `${item.type}: ${item.text}${item.note ? ` — ${item.note}` : ''}`)}\n\n` +
    `## Decisiones\n${rows(project.decisions, (item) => `${item.text}${item.reason ? ` — ${item.reason}` : ''}`)}\n\n` +
    `## Prototipo\n${project.prototypeNotes || 'Sin registrar'}\n\n` +
    `## Escenarios de prueba\n${rows(project.testScenarios)}\n\n` +
    `## Resultado / aprendizaje\n${project.outcomeNotes || 'Sin registrar'}\n\n` +
    `## Stage gate actual\n${rows(gate.criteria, (item) => `${item.complete ? '✓' : '○'} ${item.label}`)}\n\n` +
    `---\nGenerado desde Crohnoz Forge Studio. Documento de trabajo; requiere validación humana antes de comprometer alcance, costo o factibilidad.\n`;
}

export function parseProjectImport(value) {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== 'object') throw new Error('El archivo no contiene un proyecto válido.');
  const project = normalizeProject(parsed.project || parsed);
  if (!project.title || (!project.problem && !project.outcome)) throw new Error('Faltan datos mínimos del proyecto.');
  return project;
}

export function serializeProject(projectInput) {
  return JSON.stringify({ schema: 'crohnoz-forge-studio/v1', exportedAt: isoNow(), project: normalizeProject(projectInput) }, null, 2);
}
