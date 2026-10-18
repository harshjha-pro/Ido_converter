"use client";
import { useEffect, useState } from "react";

/** Loads a same-origin or data: image URL for drawing on a canvas; undefined until ready or if it fails. */
export function useLoadedImage(src: string | null | undefined): HTMLImageElement | undefined {
  const [img, setImg] = useState<HTMLImageElement>();
  useEffect(() => {
    setImg(undefined);
    if (!src) return;
    let live = true;
    const el = new Image();
    el.decoding = "async";
    el.onload = () => { if (live) setImg(el); };
    el.src = src;
    return () => { live = false; };
  }, [src]);
  return img;
}
