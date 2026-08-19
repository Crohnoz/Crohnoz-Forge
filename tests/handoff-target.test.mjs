import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProject,
  parseProjectImport,
  serializeProject,
  toMarkdown,
} from '../forge-studio-core.js';

test('handoffTarget survives project normalization and portable export/import', () => {
  const project = createProject({
    title: 'Cliente piloto',
    problem: 'Existe suficiente descripción del problema para que el proyecto sea válido en Forge Studio.',
    audience: 'Equipo comercial',
    outcome: 'Entregar decisiones trazables al repositorio operativo.',
    handoffTarget: 'Crohnoz/ZAVALA',
  });

  assert.equal(project.handoffTarget, 'Crohnoz/ZAVALA');

  const portable = serializeProject(project);
  const imported = parseProjectImport(portable);
  assert.equal(imported.handoffTarget, 'Crohnoz/ZAVALA');
  assert.match(toMarkdown(imported), /Destino de handoff:\*\* Crohnoz\/ZAVALA/);
});
