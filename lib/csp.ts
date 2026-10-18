/**
 * Content-Security-Policy for HTML pages. Scripts need a per-request nonce
 * (Next.js inlines its hydration data); 'strict-dynamic' lets those trusted
 * scripts load the app's chunks. Styles come from our own files only; pages
 * render no `style` attributes (React's runtime style updates use the CSSOM,
 * which CSP doesn't restrict). Dev mode needs inline styles for its overlay.
 */
export function buildCsp(nonce: string, dev = false): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // blob: for previews of the user's own files; data: for tiny inline assets.
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/** 128 random bits, base64. Uses Web Crypto so it runs in the Edge middleware. */
export function newNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}
