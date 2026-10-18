import Link from "next/link";
import s from "./site.module.css";

/** Mark: four crop corners framing a centred product. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 8V2h6M16 2h6v6M22 16v6h-6M8 22H2v-6" />
      <rect x="8" y="8" width="8" height="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className={s.logo} aria-label="Idoconverter home">
      <LogoMark />
      idoconverter
    </Link>
  );
}
