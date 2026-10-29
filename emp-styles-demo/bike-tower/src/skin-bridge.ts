const ALLOWED_ORIGINS = new Set([
  'http://localhost:4201',
  'http://127.0.0.1:4201',
]);

function parentOrigin(): string {
  try {
    const origin = new URL(document.referrer).origin;
    if (ALLOWED_ORIGINS.has(origin)) {
      return origin;
    }
  } catch {
    /* ignore */
  }
  return 'http://localhost:4201';
}

function ensureStyle(): HTMLStyleElement {
  let style = document.getElementById(
    'emp-skin-preview',
  ) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'emp-skin-preview';
    document.head.appendChild(style);
  }
  return style;
}

function ensureHighlightStyle(): HTMLStyleElement {
  let style = document.getElementById(
    'emp-skin-highlight',
  ) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'emp-skin-highlight';
    style.textContent = `
      .emp-skin-highlighted {
        outline: 2px solid #ff6b00 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
  return style;
}

function highlight(selector: string): void {
  ensureHighlightStyle();
  document
    .querySelectorAll('.emp-skin-highlighted')
    .forEach((element) => element.classList.remove('emp-skin-highlighted'));
  if (!selector) {
    return;
  }
  try {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) =>
      element.classList.add('emp-skin-highlighted'),
    );
    elements[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    /* ignore invalid selector */
  }
}

window.addEventListener('message', (event) => {
  if (!ALLOWED_ORIGINS.has(event.origin)) {
    return;
  }
  const type = event.data?.type;
  if (type === 'emp-skin-preview') {
    if (event.data.disableBuiltSkin) {
      document.body.setAttribute('data-skin-off', '');
    }
    const scopeClass = String(event.data.scopeClass ?? '');
    if (scopeClass) {
      document.body.classList.add(scopeClass);
    }
    ensureStyle().textContent = String(event.data.css ?? '');
    return;
  }
  if (type === 'emp-skin-highlight') {
    highlight(String(event.data.selector ?? ''));
  }
});

if (window.parent !== window) {
  window.parent.postMessage({ type: 'emp-skin-ready' }, parentOrigin());
}
