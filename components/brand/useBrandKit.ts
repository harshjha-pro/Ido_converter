"use client";
import { useEffect, useState } from "react";
import { EMPTY_KIT, loadKit, type BrandKit } from "@/lib/brandKit";

/** The saved brand kit, read after mount (browser storage doesn't exist during server rendering). */
export function useBrandKit(): BrandKit {
  const [kit, setKit] = useState<BrandKit>(EMPTY_KIT);
  useEffect(() => { setKit(loadKit()); }, []);
  return kit;
}
