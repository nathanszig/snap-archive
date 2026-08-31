import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/components/guide-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Snapchat Memories 5 Go : limite, suppression et comment sauver",
  description:
    "Snapchat limite le stockage gratuit des Memories à 5 Go avec suppression de l'excédent. Comprends la politique et exporte ce qui est à risque.",
  path: "/guide/snapchat-memories-5-go",
  ogTitle: "Snapchat Memories 5 Go — guide sauvegarde",
});

export default function SnapchatMemories5GoGuidePage() {
  return (
    <GuidePage
      title="Snapchat Memories : la limite 5 Go et la suppression"
      description="Snapchat réduit le stockage gratuit des Memories. Voici ce qui change, ce qui est à risque, et comment sauver tes snaps avant qu'ils disparaissent."
    >
      <section>
        <h2>Ce que Snapchat change</h2>
        <p>
          Le rollout 2025–2026 plafonne les <strong>Memories gratuites à 5 Go</strong>. Au-delà,
          Snapchat ne garde pas tout indéfiniment : l&apos;excédent entre dans une période de
          grâce, puis peut être <strong>supprimé</strong> — souvent en commençant par les plus
          anciennes.
        </p>
        <p>
          Concrètement : si tu as des années de snaps, une partie de ton historique peut être
          concernée même si tu n&apos;as rien changé toi-même.
        </p>
      </section>

      <section>
        <h2>Quelles memories sont « hors formule gratuite » ?</h2>
        <p>
          Snapchat garde typiquement les <strong>plus récentes</strong> dans la limite de 5 Go.
          Le reste — les plus anciennes une fois le quota dépassé — est le plus exposé à la
          suppression.
        </p>
        <p>
          SnapArchive calcule automatiquement ce lot à l&apos;import : preset{" "}
          <strong>Hors 5 Go Snap</strong> sur la{" "}
          <Link href="/export">page Exporter</Link>, basé sur la taille réelle de tes fichiers
          dans les ZIP.
        </p>
      </section>

      <section>
        <h2>Que faire maintenant (checklist)</h2>
        <ol>
          <li>
            Demande un export officiel sur{" "}
            <a href="https://accounts.snapchat.com/accounts/welcome" target="_blank" rel="noreferrer">
              accounts.snapchat.com
            </a>{" "}
            (Memories + JSON files).
          </li>
          <li>Télécharge tous les ZIP avant expiration des liens.</li>
          <li>
            Importe-les sur SnapArchive et lance le preset{" "}
            <strong>Hors 5 Go Snap</strong> pour cibler les memories à risque.
          </li>
          <li>
            Exporte un ZIP trié <code className="font-mono text-foreground">YYYY/MM/</code> avec
            dates EXIF — prêt pour iCloud Photos, Google Photos ou disque dur.
          </li>
        </ol>
      </section>

      <section>
        <h2>Pourquoi ne pas compter sur Snap seul</h2>
        <ul>
          <li>L&apos;export HTML officiel bugue sur les gros volumes.</li>
          <li>Les fichiers bruts n&apos;ont pas les bonnes dates dans la galerie.</li>
          <li>Les liens de téléchargement expirent en quelques jours.</li>
          <li>Aucune garantie que Snap conservera l&apos;excédent après la grâce.</li>
        </ul>
        <p>
          Une copie locale via export officiel + SnapArchive reste la option la plus sûre — sans
          compte tiers, sans upload cloud de tes photos chez nous.
        </p>
      </section>

      <section>
        <h2>Aller plus loin</h2>
        <p>
          Tutoriel pas à pas :{" "}
          <Link href="/guide/exporter-memories-snapchat">
            comment exporter ses Memories Snapchat
          </Link>
          .
        </p>
      </section>
    </GuidePage>
  );
}
