import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES,
  advanceProject,
  calculateReadiness,
  createProject,
  getGate,
  normalizeProject,
  parseProjectImport,
  serializeProject,
  snapshotProject,
  toMarkdown,
} from '../forge-studio-core.js';

test('Forge Studio exposes the full six-stage lifecycle', () => {
  assert.deepEqual(STAGES.map((stage) => stage.id), ['raw','discovery','blueprint','prototype','testing','outcome']);
});

test('Raw gate blocks vague projects and opens when the brief is concrete', () => {
  const vague = createProject({ title: 'X', problem: 'Muy corto', audience: '', outcome: '' });
  assert.equal(getGate(vague).ready, false);
  const ready = normalizeProject({
    ...vague,
    problem: 'El equipo registra movimientos en distintos canales y luego pierde trazabilidad operacional.',
    audience: 'Bodega y supervisores',
    outcome: 'Saber estado, responsable y última evidencia de cada movimiento.',
  });
  assert.equal(getGate(ready).ready, true);
  assert.equal(advanceProject(ready).project.stageIndex, 1);
});

test('Readiness rises as evidence and scope are added', () => {
  const base = createProject({
    problem: 'El proceso manual provoca retrabajo y no permite reconstruir con claridad qué ocurrió en cada caso.',
    audience: 'Operadores y supervisores',
    outcome: 'Reducir retrabajo y mantener un historial verificable.',
  });
  const initial = calculateReadiness(base);
  const mature = normalizeProject({
    ...base,
    constraints: 'Uso móvil, conectividad irregular y datos internos.',
    assumptions: [{ text: 'El usuario puede completar el flujo en terreno', status: 'validated' }, { text: 'El QR es durable', status: 'open' }],
    evidence: [{ text: 'Se observaron 12 casos con registros duplicados', type: 'dato' }, { text: 'Supervisión tarda 15 minutos en reconstruir un caso', type: 'observación' }],
    mvp: ['Registro', 'Estados', 'Historial', 'Exportación'],
    metrics: ['Tiempo por caso', 'Casos sin responsable'],
    prototypeNotes: 'Prototipo navegable del flujo crítico desde registro hasta cierre, sin integraciones reales.',
    testScenarios: ['Registrar un caso y encontrar su responsable'],
    decisions: [{ text: 'Postergar integración externa', reason: 'No es necesaria para validar el flujo' }],
  });
  assert.ok(calculateReadiness(mature) > initial);
});

test('Snapshots and exports keep portable project context', () => {
  const project = snapshotProject(createProject({
    title: 'ProofFlow',
    problem: 'La evidencia está dispersa entre mensajes y planillas, impidiendo reconstruir la historia de cada entrega.',
    audience: 'Operación',
    outcome: 'Tener trazabilidad verificable.',
  }), 'Antes del prototipo');
  assert.equal(project.iterations.length, 1);
  const markdown = toMarkdown(project);
  assert.match(markdown, /# ProofFlow/);
  assert.match(markdown, /Stage gate actual/);
  const serialized = serializeProject(project);
  const imported = parseProjectImport(serialized);
  assert.equal(imported.title, 'ProofFlow');
  assert.equal(imported.iterations.length, 1);
});
