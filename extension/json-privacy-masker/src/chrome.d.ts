// Minimal typings for the few Chrome extension APIs we use, so no @types/chrome dependency is needed.
declare namespace chrome {
  namespace runtime {
    const onInstalled: { addListener(cb: () => void): void };
    const onMessage: {
      addListener(cb: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void): void;
    };
    function sendMessage<T = unknown>(message: unknown): Promise<T>;
  }
  namespace contextMenus {
    interface OnClickData { menuItemId: string | number; selectionText?: string }
    function create(props: { id: string; title: string; contexts: string[]; parentId?: string }): void;
    function removeAll(cb?: () => void): void;
    const onClicked: { addListener(cb: (info: OnClickData) => void): void };
  }
  namespace action {
    function setBadgeText(details: { text: string }): Promise<void>;
    function setBadgeBackgroundColor(details: { color: string }): Promise<void>;
    function openPopup(): Promise<void>;
  }
}
