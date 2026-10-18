import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "./JsonLd";
import s from "./site.module.css";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <ol>
          {crumbs.map((c, i) => (
            <li key={c.path}>
              {i < crumbs.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
