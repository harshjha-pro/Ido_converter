import { runMode, MODE_LABELS, type Mode, type ModeResult } from './modes';

interface Pending {
  mode: Mode;
  input: string;
  result: ModeResult;
}

// Held in memory only (never chrome.storage), so the selection disappears when the worker stops.
let pending: Pending | null = null;

const MENU_PREFIX = 'jpm-';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'jpm-root', title: 'JSON Privacy Masker', contexts: ['selection'] });
    for (const mode of Object.keys(MODE_LABELS) as Mode[]) {
      chrome.contextMenus.create({ id: MENU_PREFIX + mode, parentId: 'jpm-root', title: MODE_LABELS[mode], contexts: ['selection'] });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const id = String(info.menuItemId);
  if (!id.startsWith(MENU_PREFIX) || !info.selectionText) return;
  const mode = id.slice(MENU_PREFIX.length) as Mode;
  pending = { mode, input: info.selectionText, result: runMode(mode, info.selectionText) };

  // The badge is the fallback when the browser does not allow opening the popup programmatically.
  void chrome.action.setBadgeBackgroundColor({ color: '#12382A' });
  void chrome.action.setBadgeText({ text: '1' });
  chrome.action.openPopup().catch(() => { /* user clicks the badged icon instead */ });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if ((message as { type?: string })?.type !== 'jpm-get-pending') return;
  sendResponse(pending);
  pending = null;
  void chrome.action.setBadgeText({ text: '' });
});
