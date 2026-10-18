"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";
import s from "./site.module.css";

const LINKS = [
  { href: "/product-photos", label: "Product photos" },
  { href: "/tools", label: "Tools" },
  { href: "/templates", label: "Templates" },
  { href: "/photo-guide", label: "Photo guide" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={s.header}>
      <div className={`wrap ${s.bar}`}>
        <Logo />
        <nav id="site-nav" ref={navRef} aria-label="Main" className={`${s.nav} ${open ? s.open : ""}`}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Button variant="secondary" size="small" className={s.menuBtn} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(o => !o)}>
          {open ? "Close" : "Menu"}
        </Button>
        {path !== "/product-photos" && <ButtonLink href="/product-photos" size="small" className={s.cta}>Fix my photos</ButtonLink>}
      </div>
    </header>
  );
}
