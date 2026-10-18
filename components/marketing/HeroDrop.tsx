"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/tool/DropZone";
import { setHandoff } from "@/lib/image/files";
import s from "./marketing.module.css";

export function HeroDrop() {
  const router = useRouter();
  return (
    <div className={s.heroDrop}>
      <DropZone onFiles={files => { setHandoff(files); router.push("/product-photos"); }} />
      <p className={s.trust}>
        <span>Free during early access</span>
        <span>No sign-up</span>
        <span>Photos stay on your device</span>
        <Link href="/product-photos?samples=1">Try it with sample photos</Link>
      </p>
    </div>
  );
}
