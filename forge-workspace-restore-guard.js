(() => {
  const forgeButton = document.querySelector('#forge-button');
  if (!forgeButton) return;

  document.addEventListener('click', (event) => {
    if (event.target !== forgeButton || event.isTrusted) return;

    document.querySelectorAll('[data-extended-refinement="true"].selected').forEach((button) => {
      button.classList.remove('selected');
      button.setAttribute('aria-pressed', 'false');
    });

    const preview = document.querySelector('#preview-device');
    preview?.classList.remove(
      'preview-direction-precision-grid',
      'preview-direction-warm-service',
      'preview-direction-field-utility',
    );
  }, true);
})();
