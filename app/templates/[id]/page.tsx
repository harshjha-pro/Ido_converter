import { notFound } from "next/navigation";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { templateById } from "@/lib/templates/catalog";
import { FORMATS } from "@/lib/templates/types";
import s from "../../product-photos/page.module.css";

type Params = Promise<{ id: string }>;

// Editor pages share the gallery's purpose, so they stay out of the index to avoid thin duplicates.
export async function generateMetadata({ params }: { params: Params }) {
  const t = templateById((await params).id);
  if (!t) return {};
  return pageMetadata({
    title: `${t.name} template editor`,
    description: `Edit the ${t.name.toLowerCase()} template: change the text, colours and photo, then download a ${FORMATS[t.format].w} × ${FORMATS[t.format].h} px PNG or JPG. In your browser.`,
    path: `/templates/${t.id}`,
    noindex: true,
  });
}

export default async function TemplatePage({ params }: { params: Params }) {
  const t = templateById((await params).id);
  if (!t) notFound();
  return (
    <div className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Templates", path: "/templates" }, { name: t.name, path: `/templates/${t.id}` }]} />
      <header className={s.head}>
        <h1>{t.name}</h1>
        <p className="muted">{FORMATS[t.format].label}, {FORMATS[t.format].w} × {FORMATS[t.format].h} px. Change anything in the editing panel; the preview is exactly what you’ll download.</p>
      </header>
      <TemplateEditor template={t} />
    </div>
  );
}
