import Link from "next/link";
import type { ReactNode } from "react";
import { legalSite } from "@/lib/legal/site";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-10 border-b border-card-border pb-8">
        <p className="mb-3 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            SnapArchive
          </Link>
          <span aria-hidden="true"> · </span>
          Informations légales
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">
          Dernière mise à jour : {legalSite.lastUpdated}
        </p>
      </header>
      <div className="legal-prose space-y-8 text-[0.95rem] leading-7 text-muted [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-foreground [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
      <footer className="mt-12 border-t border-card-border pt-8 text-sm text-muted">
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-foreground">
            Confidentialité
          </Link>
          <Link href="/cgu" className="hover:text-foreground">
            CGU
          </Link>
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
        </nav>
      </footer>
    </article>
  );
}
