import s from "./ui.module.css";

export type TagTone = "pass" | "check" | "fail" | "neutral";

export function Tag({ tone, children }: { tone: TagTone; children: React.ReactNode }) {
  return <span className={`${s.tag} ${s[tone]}`}>{children}</span>;
}
