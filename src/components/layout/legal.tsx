import { PageHeader } from "./page-header";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} crumbs={[{ href: "/", label: "Home" }, { label: title }]} description={`Last updated: ${updated}`} />
      <article className="container-fz max-w-3xl py-14 text-mist [&_a]:text-lime [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        <div className="mb-8 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-4 text-sm text-amber-100/90">
          This is a starting template prepared for Fitzone Supplements. It should be reviewed and confirmed by the
          business (and, ideally, a legal professional) before the website is published.
        </div>
        {children}
      </article>
    </>
  );
}
