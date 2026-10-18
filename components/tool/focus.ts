/** Focus helpers for the tool workspaces (keyboard and screen-reader users). */

/**
 * After a file is removed its button disappears and focus would fall to the page top.
 * Move it to the remove button now at the same position (or the last one), else to the drop zone.
 */
export function focusAfterRemove(index: number) {
  requestAnimationFrame(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-remove]");
    const target = buttons[Math.min(index, buttons.length - 1)] ?? document.querySelector<HTMLInputElement>("[data-dropzone] input");
    target?.focus();
  });
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab inside a modal container. */
export function trapTab(e: KeyboardEvent, container: Element | null | undefined) {
  if (e.key !== "Tab" || !container) return;
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !container.contains(active))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (active === last || !container.contains(active))) { e.preventDefault(); first.focus(); }
}
