import fs from "node:fs";

/** Reads entries from the store-only ZIPs the app produces (no compression). */
export function readZip(path: string): Map<string, Buffer> {
  const b = fs.readFileSync(path);
  const out = new Map<string, Buffer>();
  let p = 0;
  while (b.readUInt32LE(p) === 0x04034b50) {
    const size = b.readUInt32LE(p + 18), nameLen = b.readUInt16LE(p + 26), extra = b.readUInt16LE(p + 28);
    const name = b.subarray(p + 30, p + 30 + nameLen).toString("utf8");
    const start = p + 30 + nameLen + extra;
    out.set(name, b.subarray(start, start + size));
    p = start + size;
  }
  return out;
}

export function pngSize(buf: Buffer) { return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; }
export const isWebp = (buf: Buffer) => buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
export const isJpeg = (buf: Buffer) => buf[0] === 0xff && buf[1] === 0xd8;
