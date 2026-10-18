import { ButtonLink } from "@/components/ui/Button";
import s from "@/components/marketing/marketing.module.css";

export default function NotFound() {
  return (
    <div className={`wrap ${s.page}`}>
      <h1>This page doesn’t exist</h1>
      <p className={s.intro}>The link may be old or mistyped.</p>
      <div className={s.actions}><ButtonLink href="/">Go to the homepage</ButtonLink></div>
    </div>
  );
}
