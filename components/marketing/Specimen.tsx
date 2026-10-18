import { Overlay } from "@/components/tool/Overlay";
import { Tag } from "@/components/ui/Tag";
import { SPECIMEN } from "@/lib/specimen";
import s from "./marketing.module.css";

export function Specimen() {
  const { size, box, fillPct, inW, inH, inKB, outKB } = SPECIMEN;
  return (
    <figure className={s.specimen}>
      <div className={s.specBefore}>
        <div className={s.specThumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/specimen-before.jpg" alt="Before: a teal mug photographed off-centre on a greyish-white backdrop" width={480} height={360} />
        </div>
        <div className={s.specBeforeText}>
          <span className={s.specLabel}>Before</span>
          <span className="muted">{inW} × {inH} px · {inKB} KB · off-centre, grey-white backdrop</span>
        </div>
      </div>
      <div className={s.specStage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/specimen-after.jpg" alt="After: the same mug centred on a pure white square" width={size} height={size} />
        <Overlay size={size} box={box} target={0.85} detailed />
      </div>
      <dl className={s.specList}>
        <dt>Background</dt><dd>Cleaned to 255, 255, 255</dd><dd><Tag tone="pass">Pass</Tag></dd>
        <dt>Product fill</dt><dd>{fillPct}% of frame</dd><dd><Tag tone="pass">Pass</Tag></dd>
        <dt>Size</dt><dd>1600 × 1600 px · {outKB} KB</dd><dd><Tag tone="pass">Pass</Tag></dd>
        <dt>Text or logos</dt><dd>Can’t be measured</dd><dd><Tag tone="check">Check</Tag></dd>
      </dl>
      <figcaption className={s.specCaption}>Real output from the tool, using one of the sample photos. We also tell you what we can’t check.</figcaption>
    </figure>
  );
}
