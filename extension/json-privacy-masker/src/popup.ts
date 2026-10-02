import { runMode, MODE_LABELS, type Mode, type ModeResult } from './modes';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const inputEl = $<HTMLTextAreaElement>('input');
const outputEl = $<HTMLTextAreaElement>('output');
const modeEl = $<HTMLSelectElement>('mode');
const statusEl = $<HTMLParagraphElement>('status');
const copyBtn = $<HTMLButtonElement>('copy');

for (const mode of Object.keys(MODE_LABELS) as Mode[]) {
  modeEl.append(new Option(MODE_LABELS[mode], mode));
}

function show(result: ModeResult) {
  outputEl.value = result.output;
  statusEl.textContent = result.message;
  statusEl.className = result.ok ? 'status success' : 'status error';
  copyBtn.disabled = !result.output;
}

$<HTMLButtonElement>('run').addEventListener('click', () => {
  show(runMode(modeEl.value as Mode, inputEl.value));
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputEl.value);
    copyBtn.textContent = 'Copied!';
  } catch {
    outputEl.select();
    copyBtn.textContent = 'Press Ctrl+C';
  }
  setTimeout(() => { copyBtn.textContent = 'Copy safe version'; }, 2000);
});

// A right-click selection waiting in the service worker, if any.
chrome.runtime.sendMessage<{ mode: Mode; input: string; result: ModeResult } | null>({ type: 'jpm-get-pending' })
  .then((pending) => {
    if (!pending) return;
    modeEl.value = pending.mode;
    inputEl.value = pending.input;
    show(pending.result);
  })
  .catch(() => { /* no worker response: popup still works for pasted text */ });
