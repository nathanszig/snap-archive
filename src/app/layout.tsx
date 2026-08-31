import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { PendingExportBanner } from "@/components/export-reminder";
import { SITE_NAME, getSiteOrigin } from "@/lib/seo";
import "./globals.css";

const UMAMI_WEBSITE_ID = "61578fb3-4b92-4ec1-9229-ad9dc2568eed";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: `${SITE_NAME} — Exporte tes Memories Snapchat`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Transforme l'export Snapchat incompréhensible en un dossier photo propre. 100% dans ton navigateur, rien n'est envoyé sur nos serveurs.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-card-border/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                SA
              </span>
              SnapArchive
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted">
              <Link href="/#comment-ca-marche" className="hover:text-foreground">
                Comment ça marche
              </Link>
              <Link
                href="/export"
                className="rounded-full bg-accent px-4 py-2 font-medium text-accent-foreground transition hover:brightness-95"
              >
                Exporter
              </Link>
            </nav>
          </div>
        </header>
        <PendingExportBanner />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-card-border/80 px-6 py-8 text-sm text-muted">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>Traitement 100% local dans ton navigateur. Aucun upload serveur.</p>
              <p>Non affilié à Snap Inc.</p>
            </div>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/guide/exporter-memories-snapchat" className="hover:text-foreground">
                Guide export Snap
              </Link>
              <Link href="/guide/snapchat-memories-5-go" className="hover:text-foreground">
                Limite 5 Go
              </Link>
              <Link href="/mentions-legales" className="hover:text-foreground">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="hover:text-foreground">
                Confidentialité
              </Link>
              <Link href="/cgu" className="hover:text-foreground">
                CGU
              </Link>
            </nav>
          </div>
        </footer>
        {process.env.NODE_ENV === "production" ? (
          <Script
            defer
            src="https://analytics.webcooked.fr/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
