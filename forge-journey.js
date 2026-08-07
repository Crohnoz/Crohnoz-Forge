(() => {
  const ideaInput = document.querySelector('#idea-input');
  const forgeButton = document.querySelector('#forge-button');
  const blueprint = document.querySelector('#blueprint');
  const siteHeader = document.querySelector('.site-header');

  if (!ideaInput || !forgeButton || !blueprint || !siteHeader) return;

  const MIN_IDEA_LENGTH = 18;
  const stages = [
    { id: 'describe', label: 'Describe', detail: 'Problem and audience', selector: '#forge' },
    { id: 'shape', label: 'Shape', detail: 'Blueprint and scope', selector: '#blueprint' },
    { id: 'validate', label: 'Validate', detail: 'Preview and opportunity', selector: '#forge-evidence, #intelligence' },
    { id: 'deliver', label: 'Deliver', detail: 'Save, export, or review', selector: '#forge-workspace, .review-section' },
  ];

  let activeStage = 'describe';
  let blueprintReady = !blueprint.hidden;
  let blueprintFocusHandled = blueprintReady;
  let forging = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[character]);
  }

  function stageMarkup(stage, index) {
    return `
      <li>
        <button type="button" data-journey-stage="${escapeHtml(stage.id)}" data-journey-target="${escapeHtml(stage.selector)}">
          <span class="journey-stage-number">${String(index + 1).padStart(2, '0')}</span>
          <span><strong>${escapeHtml(stage.label)}</strong><small>${escapeHtml(stage.detail)}</small></span>
        </button>
      </li>`;
  }

  const journey = document.createElement('aside');
  journey.className = 'forge-journey';
  journey.setAttribute('aria-label', 'Forge journey progress');
  journey.innerHTML = `
    <div class="journey-summary">
      <span class="journey-kicker">YOUR FORGE PATH</span>
      <strong id="journey-progress-label">Step 1 of 4</strong>
    </div>
    <ol class="journey-stages">${stages.map(stageMarkup).join('')}</ol>
    <div class="journey-next">
      <span id="journey-status" role="status" aria-live="polite">Describe the problem to begin.</span>
      <button type="button" id="journey-next-action">Complete idea</button>
    </div>`;
  siteHeader.insertAdjacentElement('afterend', journey);
  document.documentElement.classList.add('forge-journey-enabled');

  const inputMeta = document.querySelector('.input-meta');
  if (inputMeta && !document.querySelector('#forge-readiness')) {
    inputMeta.insertAdjacentHTML('afterend', `
      <p class="forge-readiness" id="forge-readiness" role="status" aria-live="polite">
        Add at least ${MIN_IDEA_LENGTH} characters. No technical vocabulary is required.
      </p>`);
  }

  const status = document.querySelector('#journey-status');
  const nextAction = document.querySelector('#journey-next-action');
  const progressLabel = document.querySelector('#journey-progress-label');
  const readiness = document.querySelector('#forge-readiness');
  const forgeButtonLabel = forgeButton.querySelector('span');

  function ideaLength() {
    return ideaInput.value.trim().length;
  }

  function ideaReady() {
    return ideaLength() >= MIN_IDEA_LENGTH;
  }

  function resolveTarget(selector) {
    return selector.split(',').map((item) => document.querySelector(item.trim())).find(Boolean) || null;
  }

  function isStageUnlocked(stageId) {
    return stageId === 'describe' || blueprintReady;
  }

  function activeIndex() {
    return Math.max(0, stages.findIndex((stage) => stage.id === activeStage));
  }

  function nextStage() {
    return stages[Math.min(stages.length - 1, activeIndex() + 1)];
  }

  function actionLabel() {
    if (!blueprintReady) return ideaReady() ? 'Forge blueprint' : 'Complete idea';
    if (activeStage === 'describe') return 'View blueprint';
    if (activeStage === 'shape') return 'Validate direction';
    if (activeStage === 'validate') return 'Save or export';
    return 'Export blueprint';
  }

  function guidance() {
    if (!blueprintReady) {
      const remaining = Math.max(0, MIN_IDEA_LENGTH - ideaLength());
      if (!ideaLength()) return 'Describe the problem to begin.';
      if (remaining) return `Add ${remaining} more character${remaining === 1 ? '' : 's'} to continue.`;
      return 'Ready to forge. Press Ctrl or Command + Enter.';
    }
    const messages = {
      describe: 'Your blueprint is ready. Review the proposed direction.',
      shape: 'Refine the scope, preview, and assumptions before building.',
      validate: 'Test the opportunity, then prepare a portable artifact.',
      deliver: 'Save locally, export, or request human review.',
    };
    return messages[activeStage];
  }

  function renderJourney() {
    document.querySelectorAll('[data-journey-stage]').forEach((button) => {
      const stageId = button.dataset.journeyStage;
      const unlocked = isStageUnlocked(stageId);
      const current = stageId === activeStage;
      button.classList.toggle('is-current', current);
      button.classList.toggle('is-complete', blueprintReady && stages.findIndex((stage) => stage.id === stageId) < activeIndex());
      button.classList.toggle('is-locked', !unlocked);
      button.setAttribute('aria-current', current ? 'step' : 'false');
      button.setAttribute('aria-disabled', String(!unlocked));
    });
    progressLabel.textContent = `Step ${activeIndex() + 1} of ${stages.length}`;
    status.textContent = guidance();
    nextAction.textContent = actionLabel();
  }

  function renderInputReadiness() {
    const ready = ideaReady();
    const remaining = Math.max(0, MIN_IDEA_LENGTH - ideaLength());
    forgeButton.disabled = forging || !ready;
    forgeButton.dataset.ready = String(ready);
    ideaInput.setCustomValidity(ready ? '' : `Please add ${remaining} more character${remaining === 1 ? '' : 's'} so the Forge has enough context.`);

    if (forgeButtonLabel) {
      forgeButtonLabel.textContent = ready
        ? 'Forge the blueprint'
        : ideaLength()
          ? `Add ${remaining} more character${remaining === 1 ? '' : 's'}`
          : 'Describe the idea first';
    }

    if (readiness) {
      readiness.dataset.ready = String(ready);
      readiness.textContent = ready
        ? 'Ready to forge. Use the button or press Ctrl/Command + Enter.'
        : `Add ${remaining} more character${remaining === 1 ? '' : 's'}. Focus on the problem, not the solution.`;
    }
    renderJourney();
  }

  function scrollToTarget(target, focus = false) {
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (focus) {
      const naturallyFocusable = target.matches('a[href], button, input, select, textarea, [tabindex]');
      if (!naturallyFocusable) target.setAttribute('tabindex', '-1');
      window.setTimeout(() => target.focus({ preventScroll: true }), 420);
    }
  }

  function activateStage(stageId, shouldScroll = true) {
    const stage = stages.find((candidate) => candidate.id === stageId);
    if (!stage) return;
    if (!isStageUnlocked(stageId)) {
      activeStage = 'describe';
      status.textContent = 'Create a blueprint before opening this stage.';
      scrollToTarget(ideaInput, true);
      return;
    }
    activeStage = stageId;
    renderJourney();
    if (shouldScroll) scrollToTarget(resolveTarget(stage.selector), stageId === 'shape');
  }

  function runNextAction() {
    if (!blueprintReady) {
      if (!ideaReady()) {
        scrollToTarget(ideaInput, true);
        ideaInput.reportValidity();
        return;
      }
      forgeButton.click();
      status.textContent = 'Shaping your blueprint…';
      return;
    }

    if (activeStage === 'deliver') {
      const exportButton = document.querySelector('#workspace-export-md, #copy-to-review');
      scrollToTarget(document.querySelector('#forge-workspace, .review-section'));
      if (exportButton) window.setTimeout(() => exportButton.focus(), 420);
      return;
    }
    activateStage(nextStage().id);
  }

  journey.addEventListener('click', (event) => {
    const stageButton = event.target.closest('[data-journey-stage]');
    if (stageButton) activateStage(stageButton.dataset.journeyStage);
  });
  nextAction.addEventListener('click', runNextAction);

  ideaInput.addEventListener('input', renderInputReadiness);
  ideaInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (ideaReady() && !forgeButton.disabled) forgeButton.click();
      else scrollToTarget(ideaInput, true);
    }
  });

  forgeButton.addEventListener('click', () => {
    if (ideaReady()) {
      forging = true;
      status.textContent = 'Shaping your blueprint…';
      forgeButton.setAttribute('aria-busy', 'true');
      forgeButton.disabled = true;
    }
  });

  function syncBlueprintState() {
    const wasReady = blueprintReady;
    blueprintReady = !blueprint.hidden;
    if (blueprintReady) {
      forging = false;
      forgeButton.removeAttribute('aria-busy');
      renderInputReadiness();
      if (!wasReady) activeStage = 'shape';
      if (!blueprintFocusHandled) {
        blueprintFocusHandled = true;
        const title = document.querySelector('#blueprint-title');
        if (title) {
          title.setAttribute('tabindex', '-1');
          window.setTimeout(() => title.focus({ preventScroll: true }), 80);
        }
      }
    }
    renderJourney();
  }

  const blueprintObserver = new MutationObserver(syncBlueprintState);
  blueprintObserver.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });

  const moduleObserver = new MutationObserver(() => {
    if (document.querySelector('#forge-workspace, #forge-evidence, .review-section')) renderJourney();
  });
  moduleObserver.observe(document.body, { childList: true, subtree: true });

  if ('IntersectionObserver' in window) {
    const observed = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const stageId = visible?.target?.dataset?.journeySection;
      if (stageId && isStageUnlocked(stageId)) {
        activeStage = stageId;
        renderJourney();
      }
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] });

    function observeSections() {
      stages.forEach((stage) => {
        const target = resolveTarget(stage.selector);
        if (target && !observed.has(target)) {
          target.dataset.journeySection = stage.id;
          target.classList.add('journey-scroll-target');
          observed.add(target);
          sectionObserver.observe(target);
        }
      });
    }
    observeSections();
    const observer = new MutationObserver(observeSections);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  renderInputReadiness();
  syncBlueprintState();
})();
