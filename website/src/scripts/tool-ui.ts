// Small DOM helpers shared by tool pages. Never logs or sends input anywhere.

export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

export function setStatus(el: HTMLElement, message: string, kind: 'success' | 'error' | '' = ''): void {
  el.textContent = message;
  el.className = 'status-area' + (kind ? ` ${kind}` : '');
}

export function setupCopy(button: HTMLButtonElement, source: HTMLTextAreaElement | HTMLElement): void {
  button.addEventListener('click', async () => {
    const text = source instanceof HTMLTextAreaElement ? source.value : source.textContent ?? '';
    if (!text) return;
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied!';
    } catch {
      // Clipboard can be blocked (insecure context, permissions); selecting lets the user copy manually.
      if (source instanceof HTMLTextAreaElement) source.select();
      button.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => { button.textContent = original; }, 2000);
  });
}

export function downloadText(filename: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Above this size parsing can freeze the tab on low-end phones (TECHNICAL_SPEC section 7).
export const LARGE_INPUT_BYTES = 5 * 1024 * 1024;

export function isLargeInput(text: string): boolean {
  return new Blob([text]).size > LARGE_INPUT_BYTES;
}
