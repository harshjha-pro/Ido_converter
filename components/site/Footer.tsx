import Link from "next/link";
import { LogoMark } from "./Logo";
import s from "./site.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.footGrid}`}>
        <div>
          <span className={s.footBrand}>
            <LogoMark size={20} /> idoconverter
          </span>
          <p className={s.footNote}>Marketplace rules change and differ by category. Always confirm them in your seller panel. A pass here is a technical pre-check, not a guarantee of acceptance.</p>
        </div>
        <div>
          <h2>Product</h2>
          <ul>
            <li><Link href="/product-photos">Product photos</Link></li>
            <li><Link href="/tools/image-converter">Image converter</Link></li>
            <li><Link href="/#rules">Marketplace rules</Link></li>
            <li><Link href="/photo-guide">Photo guide</Link></li>
          </ul>
        </div>
        <div>
          <h2>About</h2>
          <ul>
            <li><Link href="/#faq">FAQ</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
