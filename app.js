(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const form = $('#idea-form');
  const transition = $('#forge-transition');
  const blueprintSection = $('#blueprint');
  const forgeButton = $('#forge-button');
  const errorBox = $('#form-error');
  const toast = $('#toast');
  const forgeStatus = $('[data-forge-status]');
  let latestBlueprint = null;
  let toastTimer = null;

  const priorityConfig = {
    speed: {
      label: 'Velocidad',
      feature: 'Acciones rápidas con la menor cantidad de pasos posible',
      metric: 'Tiempo promedio para completar el caso',
      risk: 'Automatizar pasos antes de entender las excepciones',
      screen: 'Acción rápida',
    },
    traceability: {
      label: 'Trazabilidad',
      feature: 'Historial de estados, responsables y cambios',
      metric: 'Casos sin responsable o estado verificable',
      risk: 'Registros incompletos, tardíos o duplicados',
      screen: 'Historial',
    },
    sales: {
      label: 'Ventas',
      feature: 'Seguimiento simple de oportunidades y próximos contactos',
      metric: 'Conversión entre etapas del proceso comercial',
      risk: 'Confundir actividad comercial con intención real de compra',
      screen: 'Oportunidades',
    },
    experience: {
      label: 'Experiencia',
      feature: 'Flujo guiado con lenguaje y decisiones simples',
      metric: 'Tasa de finalización sin ayuda externa',
      risk: 'Agregar instrucciones sin reducir la fricción real',
      screen: 'Recorrido guiado',
    },
    security: {
      label: 'Seguridad',
      feature: 'Roles, permisos mínimos y registro de acciones sensibles',
      metric: 'Acciones sensibles con evidencia de quién y cuándo',
      risk: 'Exponer funciones o datos a perfiles incorrectos',
      screen: 'Accesos',
    },
    analytics: {
      label: 'Analítica',
      feature: 'Indicadores accionables vinculados a decisiones concretas',
      metric: 'Decisiones apoyadas por una señal definida',
      risk: 'Crear tableros con métricas que no cambian ninguna decisión',
      screen: 'Indicadores',
    },
  };

  const stageLabels = {
    idea: 'Idea inicial',
    manual: 'Proceso manual',
    prototype: 'Prototipo existente',
    system: 'Sistema en uso',
  };

  const volumeLabels = {
    small: 'Escala acotada',
    medium: 'Escala media',
    large: 'Alta operación',
  };

  const sensitivityRisks = {
    low: 'Definir qué información puede considerarse pública o compartible',
    medium: 'Definir acceso por rol y retención para información interna',
    high: 'Aplicar privacidad por diseño, mínimos privilegios y evaluación legal/técnica antes de usar datos reales',
  };

  const promptExamples = {
    operations: {
      idea: 'Registramos entregas y movimientos en varias planillas y mensajes. Después cuesta saber quién recibió cada elemento, cuál es su estado y dónde quedó la evidencia.',
      audience: 'encargados de operación y supervisores',
      outcome: 'tener un flujo único con estado, responsable e historial verificable',
      stage: 'manual',
      priorities: ['traceability', 'speed'],
      volume: 'medium',
      sensitivity: 'medium',
    },
    product: {
      idea: 'Tengo una idea de aplicación, pero antes de construirla completa necesito saber cuál sería el flujo principal, qué debería incluir el MVP y qué tendría que validar con usuarios reales.',
      audience: 'personas que usarían la aplicación y quien administra el servicio',
      outcome: 'salir con un MVP pequeño que permita probar si la idea realmente resuelve el problema',
      stage: 'idea',
      priorities: ['experience', 'analytics'],
      volume: 'small',
      sensitivity: 'low',
    },
    sales: {
      idea: 'Los contactos comerciales quedan repartidos entre mensajes, notas y memoria. No siempre sabemos cuál es el próximo paso ni por qué una oportunidad se perdió o avanzó.',
      audience: 'equipo comercial y responsable del negocio',
      outcome: 'tener seguimiento simple de cada oportunidad y saber qué acción corresponde después',
      stage: 'manual',
      priorities: ['sales', 'analytics', 'experience'],
      volume: 'medium',
      sensitivity: 'medium',
    },
  };

  const clean = (value, fallback = '') => String(value ?? '').trim().replace(/\s+/g, ' ') || fallback;
  const sentence = (value) => {
    const normalized = clean(value);
    if (!normalized) return '';
    const body = normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/[.!?]+$/, '');
    return `${body}.`;
  };
  const unique = (items) => items.filter((item, index, list) => item && list.indexOf(item) === index);
  const setText = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value;
  };

  const renderList = (selector, items) => {
    const target = $(selector);
    if (!target) return;
    target.replaceChildren(...items.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
  };

  const renderTags = (items) => {
    const target = $('#bp-tags');
    if (!target) return;
    target.replaceChildren(...items.map((item) => {
      const span = document.createElement('span');
      span.textContent = item;
      return span;
    }));
  };

  const renderScreens = (items) => {
    const target = $('#bp-screens');
    if (!target) return;
    target.replaceChildren(...items.map((item) => {
      const span = document.createElement('span');
      span.textContent = item;
      return span;
    }));
  };

  const renderFlow = (items) => {
    const target = $('#bp-flow');
    if (!target) return;
    target.replaceChildren(...items.map((item, index) => {
      const li = document.createElement('li');
      const number = document.createElement('span');
      const copy = document.createElement('div');
      const title = document.createElement('b');
      const description = document.createElement('small');
      number.textContent = String(index + 1);
      title.textContent = item.title;
      description.textContent = item.description;
      copy.append(title, description);
      li.append(number, copy);
      return li;
    }));
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const selectedPriorities = () => $$('input[name="priority"]:checked').map((input) => input.value);

  const titleFromOutcome = (outcome) => {
    const words = clean(outcome, 'Nuevo producto').replace(/[.,;:!?]/g, '').split(' ').slice(0, 10);
    const title = words.join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const getReadiness = ({ idea, outcome, stage, volume, sensitivity, priorities }) => {
    const impactScore = Math.min(5,
      1 +
      (priorities.length >= 2 ? 1 : 0) +
      (idea.length >= 100 ? 1 : 0) +
      (outcome.length >= 45 ? 1 : 0) +
      (volume !== 'small' ? 1 : 0)
    );
    const complexityScore =
      ({ idea: 0, manual: 1, prototype: 2, system: 3 }[stage] ?? 0) +
      ({ small: 1, medium: 2, large: 3 }[volume] ?? 1) +
      ({ low: 0, medium: 1, high: 3 }[sensitivity] ?? 0) +
      (priorities.length >= 4 ? 1 : 0);

    const impact = impactScore >= 4 ? 'Alto' : impactScore >= 3 ? 'Medio' : 'Inicial';
    const complexity = complexityScore >= 7 ? 'Alta' : complexityScore >= 4 ? 'Media' : 'Baja';

    let nextStep = 'Prototipo';
    let nextNote = 'Probar el flujo principal con pocas personas antes de construir una solución completa.';
    let recommendation = 'Prototipar el flujo principal';
    let recommendationNote = 'Validar con usuarios reales antes de sumar automatizaciones o integraciones.';

    if (sensitivity === 'high') {
      nextStep = 'Discovery seguro';
      nextNote = 'Definir datos, permisos, retención y restricciones antes de probar con información real.';
      recommendation = 'Aclarar arquitectura y manejo de datos';
      recommendationNote = 'La sensibilidad declarada exige validar privacidad y seguridad antes de implementar el flujo completo.';
    } else if (stage === 'system') {
      nextStep = 'Auditoría';
      nextNote = 'Mapear el flujo existente, la deuda y las integraciones antes de reemplazar o automatizar componentes.';
      recommendation = 'Auditar el sistema y recortar el alcance';
      recommendationNote = 'Con un sistema en uso, conviene mejorar un recorrido crítico antes de plantear una reconstrucción completa.';
    } else if (stage === 'prototype') {
      nextStep = 'Prueba';
      nextNote = 'Usar el prototipo con usuarios reales y registrar dónde abandonan, dudan o necesitan ayuda.';
      recommendation = 'Validar el prototipo con usuarios';
      recommendationNote = 'La siguiente evidencia debería venir del uso, no de agregar más pantallas.';
    } else if (stage === 'manual') {
      nextStep = 'Prototipo de flujo';
      nextNote = 'Representar el proceso mínimo y probarlo junto a quienes hoy ejecutan el trabajo manual.';
      recommendation = 'Digitalizar primero el cuello de botella';
      recommendationNote = 'No conviene automatizar todo el proceso manual de una vez; parte por el tramo que concentra más fricción.';
    }

    return {
      impact,
      impactNote: impact === 'Alto' ? 'Hay suficiente contexto y una señal de valor concreta para justificar validación.' : impact === 'Medio' ? 'Hay un resultado útil que puede medirse, pero todavía faltan supuestos por comprobar.' : 'Primero conviene precisar el resultado y observar el proceso real.',
      complexity,
      complexityNote: complexity === 'Alta' ? 'Divide el problema en un MVP menor y separa dependencias antes de construir.' : complexity === 'Media' ? 'Mantén acotado el primer alcance y posterga integraciones no esenciales.' : 'El alcance inicial parece abordable si se mantiene la disciplina del MVP.',
      nextStep,
      nextNote,
      recommendation,
      recommendationNote,
    };
  };

  const buildBlueprint = () => {
    const idea = clean($('#idea').value);
    const audience = clean($('#audience').value);
    const outcome = clean($('#outcome').value);
    const constraints = clean($('#constraints').value);
    const stage = form.elements.stage.value;
    const volume = $('#volume').value;
    const sensitivity = $('#sensitivity').value;
    const priorities = selectedPriorities();
    const configs = priorities.map((priority) => priorityConfig[priority]).filter(Boolean);
    const users = audience.split(/,| y |\//).map((item) => clean(item)).filter(Boolean).slice(0, 4);
    if (users.length === 1) users.push('Responsable de decisión o supervisión');

    const flow = [
      { title: 'Capturar', description: 'Registrar solo la información mínima necesaria para iniciar el caso.' },
      { title: 'Decidir', description: `Aplicar una regla clara orientada a ${configs[0]?.label.toLowerCase() ?? 'resolver el resultado esperado'}.` },
      { title: 'Resolver', description: `Guiar a ${users[0]?.toLowerCase() ?? 'la persona usuaria'} hacia una acción verificable.` },
      { title: 'Aprender', description: 'Registrar excepciones y una métrica que permita mejorar el flujo.' },
    ];

    const features = unique([
      'Registro central del proceso',
      ...configs.map((config) => config.feature),
      'Historial básico de cambios',
    ]).slice(0, 6);
    const screens = unique(['Resumen', 'Nuevo registro', ...configs.map((config) => config.screen), 'Detalle']).slice(0, 6);
    const risks = unique([
      ...configs.map((config) => config.risk),
      sensitivityRisks[sensitivity],
      constraints ? `Validar esta restricción: ${constraints}` : 'Validar adopción y excepciones con usuarios reales',
    ]).slice(0, 5);
    const metrics = unique([
      ...configs.map((config) => config.metric),
      'Casos completados sin retrabajo',
      'Porcentaje de usuarios que completa el flujo sin ayuda',
    ]).slice(0, 5);

    const readiness = getReadiness({ idea, outcome, stage, volume, sensitivity, priorities });
    const title = titleFromOutcome(outcome);
    const summary = `${sentence(outcome)} Parte desde “${stageLabels[stage]}” y prioriza ${configs.map((config) => config.label.toLowerCase()).join(', ')}.`;

    return {
      title,
      summary,
      problem: sentence(idea),
      users,
      flow,
      features,
      screens,
      risks,
      metrics,
      tags: unique([stageLabels[stage], volumeLabels[volume], ...configs.slice(0, 2).map((config) => config.label)]),
      recommendation: readiness.recommendation,
      recommendationNote: readiness.recommendationNote,
      readiness,
      source: { idea, audience, outcome, stage, volume, sensitivity, constraints, priorities: configs.map((config) => config.label) },
    };
  };

  const renderBlueprint = (data) => {
    latestBlueprint = data;
    setText('#bp-title', data.title);
    setText('#bp-summary', data.summary);
    setText('#bp-problem', data.problem);
    renderTags(data.tags);
    renderList('#bp-users', data.users);
    renderFlow(data.flow);
    renderList('#bp-features', data.features);
    renderScreens(data.screens);
    renderList('#bp-risks', data.risks);
    renderList('#bp-metrics', data.metrics);
    setText('#bp-recommendation', data.recommendation);
    setText('#bp-recommendation-note', data.recommendationNote);
    setText('#impact-label', data.readiness.impact);
    setText('#impact-note', data.readiness.impactNote);
    setText('#complexity-label', data.readiness.complexity);
    setText('#complexity-note', data.readiness.complexityNote);
    setText('#next-step-label', data.readiness.nextStep);
    setText('#next-step-note', data.readiness.nextNote);
    setText('#blueprint-state-label', 'Blueprint generado en este navegador');
    setText('#blueprint-context', 'Resultado generado localmente a partir de lo que escribiste. Puedes ajustarlo, copiarlo o descargarlo sin enviar nada a Crohnoz Labs.');
    blueprintSection.dataset.state = 'generated';
    $('#review-blueprint').value = exportBlueprint(data, true);
  };

  const exportBlueprint = (data = latestBlueprint, compact = false) => {
    if (!data) {
      return 'CROHNOZ FORGE — EJEMPLO EXPLORATORIO\nEste contenido es demostrativo y no corresponde a una idea enviada.';
    }
    const lines = [
      'CROHNOZ FORGE — BLUEPRINT EXPLORATORIO',
      compact ? null : 'Generado localmente en el navegador. Requiere validación humana antes de construir.',
      '',
      `TÍTULO: ${data.title}`,
      `RESUMEN: ${data.summary}`,
      '',
      `PROBLEMA: ${data.problem}`,
      `USUARIOS: ${data.users.join('; ')}`,
      `MVP: ${data.features.join('; ')}`,
      `PANTALLAS: ${data.screens.join('; ')}`,
      `RIESGOS: ${data.risks.join('; ')}`,
      `MÉTRICAS: ${data.metrics.join('; ')}`,
      `PRÓXIMO PASO: ${data.recommendation} — ${data.recommendationNote}`,
      '',
      `IMPACTO POTENCIAL: ${data.readiness.impact}`,
      `COMPLEJIDAD RELATIVA: ${data.readiness.complexity}`,
      `RECOMENDACIÓN: ${data.readiness.nextStep}`,
      data.source.constraints ? `RESTRICCIONES DECLARADAS: ${data.source.constraints}` : null,
      '',
      'Nota: resultado exploratorio; no es cotización, contrato ni garantía de factibilidad.',
    ];
    return lines.filter((line) => line !== null).join('\n');
  };

  const validateForm = () => {
    errorBox.hidden = true;
    const required = [$('#idea'), $('#audience'), $('#outcome')];
    const invalid = required.find((field) => !clean(field.value));
    if (invalid) {
      invalid.focus();
      errorBox.textContent = 'Completa el problema, quién lo vive y el resultado que esperas.';
      errorBox.hidden = false;
      return false;
    }
    if ($('#idea').value.trim().length < 30) {
      $('#idea').focus();
      errorBox.textContent = 'Describe la situación con un poco más de detalle (mínimo 30 caracteres).';
      errorBox.hidden = false;
      return false;
    }
    if (selectedPriorities().length === 0) {
      errorBox.textContent = 'Elige al menos una prioridad para orientar el blueprint.';
      errorBox.hidden = false;
      return false;
    }
    if (!$('#safe-consent').checked || !$('#exploratory-consent').checked) {
      errorBox.textContent = 'Confirma los dos resguardos antes de generar el blueprint.';
      errorBox.hidden = false;
      return false;
    }
    return true;
  };

  const setPrompt = (key) => {
    const example = promptExamples[key];
    if (!example) return;
    $('#idea').value = example.idea;
    $('#audience').value = example.audience;
    $('#outcome').value = example.outcome;
    $('#volume').value = example.volume;
    $('#sensitivity').value = example.sensitivity;
    $$('input[name="stage"]').forEach((input) => { input.checked = input.value === example.stage; });
    $$('input[name="priority"]').forEach((input) => { input.checked = example.priorities.includes(input.value); });
    $$('textarea[maxlength]').forEach((field) => field.dispatchEvent(new Event('input')));
    $('#forge').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => $('#idea').focus({ preventScroll: true }), 450);
    showToast('Ejemplo cargado. Puedes editarlo antes de forjar.');
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const fallback = document.createElement('textarea');
    fallback.value = value;
    fallback.setAttribute('readonly', '');
    fallback.className = 'honeypot';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.setAttribute('tabindex', '-1');
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  };

  const downloadText = (value, filename) => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateForm()) return;

      forgeButton.disabled = true;
      forgeButton.setAttribute('aria-busy', 'true');
      transition.hidden = false;
      forgeStatus.textContent = 'FORJANDO…';
      transition.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => {
        const data = buildBlueprint();
        renderBlueprint(data);
        transition.hidden = true;
        forgeButton.disabled = false;
        forgeButton.removeAttribute('aria-busy');
        forgeStatus.textContent = 'BLUEPRINT LISTO';
        blueprintSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        showToast('Blueprint listo. Puedes copiarlo, descargarlo o ajustarlo.');
      }, reducedMotion ? 0 : 1050);
    });
  }

  $$('[data-prompt]').forEach((button) => button.addEventListener('click', () => setPrompt(button.dataset.prompt)));

  $$('textarea[maxlength]').forEach((field) => {
    const counter = document.querySelector(`[data-count="${field.id}"]`);
    const update = () => { if (counter) counter.textContent = String(field.value.length); };
    field.addEventListener('input', update);
    update();
  });

  $('#edit-blueprint')?.addEventListener('click', () => {
    $('#forge').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => $('#idea').focus({ preventScroll: true }), 450);
  });

  $('#new-blueprint')?.addEventListener('click', () => {
    form.reset();
    $('#constraints').value = '';
    $$('textarea[maxlength]').forEach((field) => field.dispatchEvent(new Event('input')));
    errorBox.hidden = true;
    forgeStatus.textContent = 'LISTO PARA FORJAR';
    $('#forge').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => $('#idea').focus({ preventScroll: true }), 450);
    showToast('Formulario limpio. El blueprint anterior sigue disponible hasta que generes otro.');
  });

  $('#copy-blueprint')?.addEventListener('click', async () => {
    try {
      await copyText(exportBlueprint());
      showToast(latestBlueprint ? 'Blueprint copiado al portapapeles.' : 'Ejemplo copiado al portapapeles.');
    } catch {
      showToast('No pude copiar automáticamente. Prueba con la descarga.');
    }
  });

  $('#download-blueprint')?.addEventListener('click', () => {
    const safeName = latestBlueprint ? latestBlueprint.title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48) : 'ejemplo';
    downloadText(exportBlueprint(), `crohnoz-forge-${safeName || 'blueprint'}.txt`);
    showToast('Archivo preparado en formato de texto.');
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('review') === 'sent') {
    const status = $('#review-status');
    if (status) status.hidden = false;
  }
})();
