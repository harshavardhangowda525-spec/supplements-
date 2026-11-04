import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/brand/reveal";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-mist">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} className="hover:text-lime">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white">
                {c.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="size-3" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_0%,rgb(198_255_0/0.12),transparent_60%)]" />
      <div className="container-fz relative py-12 sm:py-16">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <Reveal>
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="display text-6xl text-white sm:text-7xl lg:text-8xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-base text-mist sm:text-lg">{description}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
