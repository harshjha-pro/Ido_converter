"use client";
import { useEffect, useRef } from "react";
import { renderTemplate, type Assets } from "@/lib/templates/render";
import { FORMATS, type Template } from "@/lib/templates/types";
import type { DesignState } from "@/lib/templates/state";
import s from "./templates.module.css";

interface Props { template: Template; state: DesignState; assets: Assets; label: string; className?: string }

/**
 * Live preview: draws the design at the size it's shown (times the screen's pixel ratio) with the
 * same renderer the export uses. Redraws when the design, assets or the box size change.
 */
export function DesignCanvas({ template, state, assets, label, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { w, h } = FORMATS[template.format];
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const cssW = c.clientWidth || 320;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const scale = (cssW * dpr) / w;
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      const ctx = c.getContext("2d");
      if (ctx) renderTemplate(ctx, template, state, assets, scale);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [template, state, assets, w, h]);
  return <canvas ref={ref} role="img" aria-label={label} className={`${s.canvas} ${s[`ratio_${template.format}`]} ${className ?? ""}`} />;
}
