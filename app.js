(() => {
  'use strict';
  const form = document.querySelector('#idea-form');
  const transition = document.querySelector('#forge-transition');
  const blueprint = document.querySelector('[data-blueprint]');
  const nextButton = document.querySelector('#next-step');
  const backButton = document.querySelector('#back-step');
  const forgeButton = document.querySelector('#forge-button');
  const errorBox = document.querySelector('#form-error');
  let currentStep = 1;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const text = (selector, value) => { const node = $(selector); if (node) node.textContent = value; };
  const renderList = (selector, items) => {
    const target = $(selector); if (!target) return;
    target.replaceChildren(...items.map((item) => { const li = document.createElement('li'); li.textContent = item; return li; }));
  };
  const renderTags = (items) => {
    const target = $('#bp-tags'); if (!target) return;
    target.replaceChildren(...items.map((item) => { const span = document.createElement('span'); span.textContent = item; return span; }));
  };
  const renderFlow = (items) => {
    const target = $('#bp-flow'); if (!target) return;
    target.replaceChildren(...items.map((item, index) => {
      const li = document.createElement('li'); const number = document.createElement('span'); const copy = document.createElement('div');
      const title = document.createElement('b'); const description = document.createElement('small');
      number.textContent = String(index + 1); title.textContent = item.title; description.textContent = item.description;
      copy.append(title, description); li.append(number, copy); return li;
    }));
  };
  const renderScreens = (items) => {
    const target = $('#bp-screens'); if (!target) return;
    target.replaceChildren(...items.map((item) => { const span = document.createElement('span'); span.textContent = item; return span; }));
  };
  const clean = (value, fallback = '') => value.trim().replace(/\s+/g, ' ') || fallback;
  const sentence = (value) => { const normalized = clean(value); return normalized ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1).replace(/[.!?]+$/, '')}.` : ''; };
  const titleFromIdea = (idea) => { const words = clean(idea, 'Nueva idea de producto').replace(/[.,;:!?]/g, '').split(' ').slice(0, 9); const result = words.join(' '); return `${result.charAt(0).toUpperCase()}${result.slice(1)}`; };

  const priorityConfig = {
    speed: { label: 'Velocidad', feature: 'Acciones rápidas y reducción de pasos', metric: 'Tiempo promedio por caso', risk: 'Automatizar antes de entender las excepciones', screen: 'Acción rápida' },
    traceability: { label: 'Trazabilidad', feature: 'Historial de estados y responsables', metric: 'Casos sin responsable identificado', risk: 'Registros incompletos o duplicados', screen: 'Historial' },
    sales: { label: 'Ventas', feature: 'Embudo de oportunidades y seguimiento', metric: 'Conversión por etapa', risk: 'Medir actividad sin validar intención de compra', screen: 'Oportunidades' },
    experience: { label: 'Experiencia', feature: 'Flujo guiado y lenguaje simple', metric: 'Tasa de finalización del proceso', risk: 'Agregar información sin jerarquía clara', screen: 'Recorrido guiado' },
    security: { label: 'Seguridad', feature: 'Roles, permisos mínimos y auditoría', metric: 'Acciones sensibles auditadas', risk: 'Exponer funciones o datos a perfiles incorrectos', screen: 'Accesos' },
    analytics: { label: 'Analítica', feature: 'Indicadores y alertas accionables', metric: 'Decisiones apoyadas por evidencia', risk: 'Presentar supuestos como métricas reales', screen: 'Indicadores' },
  };
  const stageLabels = { idea: 'Idea inicial', manual: 'Proceso manual', prototype: 'Prototipo existente', system: 'Sistema en uso' };
  const sensitivityRisks = { low: 'Mantener claridad sobre qué información es pública', medium: 'Definir acceso por rol y retención de información interna', high: 'Aplicar evaluación legal, privacidad por diseño y separación estricta de ambientes' };
  const volumeTags = { small: 'Escala acotada', medium: 'Escala media', large: 'Alta operación' };

  const validateStep = () => {
    errorBox.hidden = true;
    if (currentStep === 1) {
      const required = ['#idea', '#audience', '#outcome'].map((selector) => $(selector));
      const invalid = required.find((field) => !clean(field.value));
      if (invalid) { invalid.focus(); errorBox.textContent = 'Completa el problema, los usuarios y el resultado esperado para continuar.'; errorBox.hidden = false; return false; }
      if ($('#idea').value.trim().length < 30) { $('#idea').focus(); errorBox.textContent = 'Describe la situación con un poco más de detalle (mínimo 30 caracteres).'; errorBox.hidden = false; return false; }
    }
    if (currentStep === 2 && $$('input[name="priority"]:checked').length === 0) { errorBox.textContent = 'Selecciona al menos una prioridad para orientar el blueprint.'; errorBox.hidden = false; return false; }
    if (currentStep === 3 && (!$('#safe-consent').checked || !$('#exploratory-consent').checked)) { errorBox.textContent = 'Debes confirmar ambos resguardos antes de generar el blueprint.'; errorBox.hidden = false; return false; }
    return true;
  };

  const showStep = (step) => {
    currentStep = Math.max(1, Math.min(3, step));
    $$('[data-step]').forEach((panel) => { const active = Number(panel.dataset.step) === currentStep; panel.classList.toggle('is-active', active); panel.hidden = !active; });
    $$('[data-step-button]').forEach((button) => { const number = Number(button.dataset.stepButton); button.classList.toggle('is-active', number === currentStep); if (number === currentStep) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
    backButton.hidden = currentStep === 1; nextButton.hidden = currentStep === 3; forgeButton.hidden = currentStep !== 3; errorBox.hidden = true;
  };

  const generateBlueprint = () => {
    const idea = clean($('#idea').value); const audience = clean($('#audience').value); const outcome = clean($('#outcome').value); const constraints = clean($('#constraints').value);
    const stage = form.elements.stage.value; const volume = $('#volume').value; const sensitivity = $('#sensitivity').value;
    const priorities = $$('input[name="priority"]:checked').map((input) => input.value); const configs = priorities.map((priority) => priorityConfig[priority]).filter(Boolean);
    const users = audience.split(/,| y |\//).map((item) => clean(item)).filter(Boolean).slice(0, 4); if (users.length === 1) users.push('Supervisor o responsable de decisión');
    const flow = [
      { title: 'Capturar', description: 'Registrar el caso con la información mínima necesaria.' },
      { title: 'Priorizar', description: `Aplicar reglas iniciales enfocadas en ${configs[0]?.label.toLowerCase() ?? 'el resultado esperado'}.` },
      { title: 'Resolver', description: `Guiar a ${users[0]?.toLowerCase() ?? 'la persona usuaria'} hacia una acción verificable.` },
      { title: 'Aprender', description: 'Medir resultados, excepciones y oportunidades de mejora.' },
    ];
    const features = ['Registro central del proceso', ...configs.map((config) => config.feature), 'Historial y exportación básica'].filter((item, index, list) => list.indexOf(item) === index).slice(0, 6);
    const screens = ['Resumen', 'Nuevo registro', ...configs.map((config) => config.screen), 'Configuración'].filter((item, index, list) => list.indexOf(item) === index).slice(0, 6);
    const risks = [...configs.map((config) => config.risk), sensitivityRisks[sensitivity], constraints ? `Validar la restricción declarada: ${constraints}` : 'Validar adopción y excepciones con usuarios reales'].filter((item, index, list) => list.indexOf(item) === index).slice(0, 5);
    const metrics = [...configs.map((config) => config.metric), 'Casos completados sin retrabajo', 'Satisfacción del usuario principal'].filter((item, index, list) => list.indexOf(item) === index).slice(0, 5);
    const title = titleFromIdea(idea); const summary = `${sentence(outcome)} La propuesta parte desde un estado de “${stageLabels[stage]}” y prioriza ${configs.map((config) => config.label.toLowerCase()).join(', ')}.`;
    text('#bp-title', title); text('#bp-summary', summary); text('#bp-problem', sentence(idea)); renderTags([stageLabels[stage], volumeTags[volume], ...configs.slice(0, 2).map((config) => config.label)]);
    renderList('#bp-users', users); renderFlow(flow); renderList('#bp-features', features); renderScreens(screens); renderList('#bp-risks', risks); renderList('#bp-metrics', metrics);
    $('#review-blueprint').value = [`Título: ${title}`, `Problema: ${idea}`, `Usuarios: ${audience}`, `Resultado: ${outcome}`, `Prioridades: ${configs.map((config) => config.label).join(', ')}`, `Sensibilidad declarada: ${sensitivity}`, constraints ? `Restricciones: ${constraints}` : null].filter(Boolean).join(' | ');
    $('#scope-slider').value = String(volume === 'large' ? 65 : volume === 'medium' ? 45 : 30); $('#automation-slider').value = priorities.includes('speed') ? '60' : '40'; $('#integration-slider').value = stage === 'system' ? '55' : stage === 'prototype' ? '35' : '20'; updateIntelligence();
  };

  const updateIntelligence = () => {
    const scope = Number($('#scope-slider').value); const automation = Number($('#automation-slider').value); const integration = Number($('#integration-slider').value);
    const impact = Math.round(Math.min(100, 38 + scope * .28 + automation * .27 + Math.max(0, 35 - integration) * .14));
    const complexity = Math.round(Math.min(100, 12 + scope * .38 + automation * .22 + integration * .34));
    text('#scope-value', `${scope}%`); text('#automation-value', `${automation}%`); text('#integration-value', `${integration}%`); text('#impact-score', String(impact)); text('#complexity-score', String(complexity));
    $('#impact-bar').style.width = `${impact}%`; $('#complexity-bar').style.width = `${complexity}%`;
    if (impact >= 72 && complexity <= 58) { text('#hypothesis-label', 'Prometedora'); text('#hypothesis-note', 'El escenario justifica validar usuarios y construir un prototipo enfocado.'); }
    else if (complexity >= 72) { text('#hypothesis-label', 'Dividir alcance'); text('#hypothesis-note', 'Conviene separar el problema en un MVP pequeño antes de incorporar automatizaciones e integraciones.'); }
    else { text('#hypothesis-label', 'Validable'); text('#hypothesis-note', 'Conviene prototipar el flujo principal antes de comprometer una construcción completa.'); }
  };

  const updateSimulator = () => {
    const cases = Math.max(0, Number($('#monthly-cases').value) || 0); const minutes = Math.max(0, Number($('#minutes-saved').value) || 0); const hours = Math.round((cases * minutes / 60) * 10) / 10;
    text('#hours-saved', `${hours.toLocaleString('es-CL')} h`); text('#annual-hours', `${Math.round(hours * 12).toLocaleString('es-CL')} h al año`);
  };

  const resetBlueprint = () => {
    text('#bp-title', 'Trazabilidad simple para una bodega pequeña'); text('#bp-summary', 'Una propuesta para registrar recepción, movimiento y entrega de equipos sin depender de planillas dispersas.'); text('#bp-problem', 'La información de cada equipo se reparte entre mensajes, planillas y recuerdos, dificultando demostrar responsables y estados.'); renderTags(['Operaciones', 'Trazabilidad', 'Mobile-first']); renderList('#bp-users', ['Encargado de recepción', 'Operador de bodega', 'Supervisor']);
    renderFlow([{ title: 'Registrar', description: 'Escanear o ingresar el identificador.' }, { title: 'Asignar', description: 'Definir estado, ubicación y responsable.' }, { title: 'Evidenciar', description: 'Adjuntar fotografía o confirmación.' }, { title: 'Supervisar', description: 'Resolver excepciones y generar reportes.' }]);
    renderList('#bp-features', ['Registro por identificador', 'Estados y responsables', 'Historial básico', 'Exportación de reporte']); renderScreens(['Resumen', 'Registrar', 'Detalle', 'Incidencias']); renderList('#bp-risks', ['Identificadores duplicados', 'Adopción incompleta del equipo', 'Conectividad intermitente']); renderList('#bp-metrics', ['Tiempo de registro', 'Casos sin responsable', 'Incidencias resueltas']);
    $('#scope-slider').value = '45'; $('#automation-slider').value = '50'; $('#integration-slider').value = '25'; $('#review-blueprint').value = 'Blueprint no generado todavía'; updateIntelligence();
  };

  if (form) {
    nextButton.addEventListener('click', () => { if (validateStep()) showStep(currentStep + 1); }); backButton.addEventListener('click', () => showStep(currentStep - 1));
    form.addEventListener('submit', (event) => { event.preventDefault(); if (!validateStep()) return; form.hidden = true; transition.hidden = false; transition.scrollIntoView({ behavior: 'smooth', block: 'center' }); window.setTimeout(() => { generateBlueprint(); transition.hidden = true; form.hidden = false; showStep(1); blueprint.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 1700); });
  }
  $$('textarea[maxlength]').forEach((field) => { const counter = document.querySelector(`[data-count="${field.id}"]`); const update = () => { if (counter) counter.textContent = String(field.value.length); }; field.addEventListener('input', update); update(); });
  ['#scope-slider', '#automation-slider', '#integration-slider'].forEach((selector) => $(selector)?.addEventListener('input', updateIntelligence));
  ['#monthly-cases', '#minutes-saved'].forEach((selector) => $(selector)?.addEventListener('input', updateSimulator));
  $('#reset-blueprint')?.addEventListener('click', resetBlueprint);
  const params = new URLSearchParams(window.location.search); if (params.get('review') === 'sent') { const status = $('#review-status'); if (status) status.hidden = false; }
  updateIntelligence(); updateSimulator();
})();
