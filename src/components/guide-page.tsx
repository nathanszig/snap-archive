import Link from "next/link";
import type { ReactNode } from "react";

interface GuidePageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function GuidePage({ title, description, children }: GuidePageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-10 border-b border-card-border pb-8">
        <p className="mb-3 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            SnapArchive
          </Link>
          <span aria-hidden="true"> · </span>
          Guide
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted">{description}</p>
        <Link
          href="/export"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:brightness-95"
        >
          Ouvrir l&apos;outil d&apos;export
        </Link>
      </header>

      <div className="guide-prose space-y-8 text-[0.95rem] leading-7 text-muted [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>

      <footer className="mt-12 border-t border-card-border pt-8">
        <p className="text-sm text-muted">
          Prêt ?{" "}
          <Link href="/export" className="font-medium text-foreground underline">
            Importe tes ZIP mydata sur SnapArchive
          </Link>{" "}
          — 100 % dans ton navigateur, sans compte.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <Link href="/guide/exporter-memories-snapchat" className="hover:text-foreground">
            Exporter Memories Snapchat
          </Link>
          <Link href="/guide/snapchat-memories-5-go" className="hover:text-foreground">
            Limite 5 Go Snap
          </Link>
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
        </nav>
      </footer>
    </article>
  );
}
