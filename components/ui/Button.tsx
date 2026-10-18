import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import s from "./ui.module.css";

type Variant = "primary" | "secondary";
interface Common { variant?: Variant; size?: "default" | "small"; full?: boolean; children: ReactNode; className?: string }

function cls({ variant = "primary", size = "default", full, className }: Omit<Common, "children">) {
  return [s.btn, variant === "secondary" && s.secondary, size === "small" && s.small, full && s.full, className].filter(Boolean).join(" ");
}

export function Button({ variant, size, full, className, children, ref, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> }) {
  return <button ref={ref} type="button" className={cls({ variant, size, full, className })} {...rest}>{children}</button>;
}

export function ButtonLink({ href, variant, size, full, className, children, external }: Common & { href: string; external?: boolean }) {
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls({ variant, size, full, className })}>{children}</a>;
  return <Link href={href} className={cls({ variant, size, full, className })}>{children}</Link>;
}

export function TextButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={[s.textBtn, className].filter(Boolean).join(" ")} {...rest}>{children}</button>;
}
