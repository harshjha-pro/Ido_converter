import type { Box } from "@/lib/image/engine";

/** Crop-mark corners and the product box; in detailed mode also the target fill square and dimension lines. */
export function Overlay({ size, box, target, detailed }: { size: number; box: Box; target: number; detailed?: boolean }) {
  const S = size, k = S * 0.06, i = S * 0.02;
  const corners = `M${i} ${i + k}V${i}H${i + k}M${S - i - k} ${i}H${S - i}V${i + k}M${S - i} ${S - i - k}V${S - i}H${S - i - k}M${i + k} ${S - i}H${i}V${S - i - k}`;
  const t = S * target, o = (S - t) / 2;
  const y = Math.max(i, box.y - S * 0.03), x = Math.max(i, box.x - S * 0.03), tk = S * 0.012;
  const dims = `M${box.x} ${y}H${box.x + box.w}M${box.x} ${y - tk}V${y + tk}M${box.x + box.w} ${y - tk}V${y + tk}M${x} ${box.y}V${box.y + box.h}M${x - tk} ${box.y}H${x + tk}M${x - tk} ${box.y + box.h}H${x + tk}`;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} aria-hidden="true" fill="none">
      <path d={corners} stroke="var(--img-mark)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {detailed && <rect x={o} y={o} width={t} height={t} stroke="var(--img-guide)" strokeWidth="1" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />}
      {detailed && <path d={dims} stroke="var(--img-guide)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
      <rect x={box.x} y={box.y} width={box.w} height={box.h} stroke="var(--img-guide)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
