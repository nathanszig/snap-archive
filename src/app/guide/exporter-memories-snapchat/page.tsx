import type { Metadata } from "next";
import { GuidePage } from "@/components/guide-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Comment exporter ses Memories Snapchat (guide 2026)",
  description:
    "Tutoriel complet : demander l'export officiel Snapchat, télécharger les ZIP mydata et transformer tes Memories en archive triée avec SnapArchive.",
  path: "/guide/exporter-memories-snapchat",
  ogTitle: "Exporter ses Memories Snapchat — guide complet",
});

export default function ExporterMemoriesGuidePage() {
  return (
    <GuidePage
      title="Comment exporter ses Memories Snapchat"
      description="Le seul export fiable passe par « Mes données » sur Snapchat. Voici la marche à suivre, sans raccourci douteux."
    >
      <section>
        <h2>Pourquoi l&apos;export officiel est obligatoire</h2>
        <p>
          SnapArchive ne se connecte pas à ton compte Snapchat. C&apos;est volontaire : plus
          sûr, plus légal, et plus fiable. Tu demandes un export officiel, tu reçois des ZIP{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
            mydata~….zip
          </code>
          , puis tu les importes dans SnapArchive pour obtenir un dossier photo propre.
        </p>
      </section>

      <section>
        <h2>Étape 1 — Demander l&apos;export sur Snapchat</h2>
        <ol>
          <li>
            Va sur{" "}
            <a href="https://accounts.snapchat.com/accounts/welcome" target="_blank" rel="noreferrer">
              accounts.snapchat.com
            </a>{" "}
            et connecte-toi.
          </li>
          <li>
            Ouvre <strong>Mes données</strong> (My Data).
          </li>
          <li>
            Coche <strong>Export your Memories</strong> et{" "}
            <strong>Export JSON files</strong> — indispensable pour les dates et le GPS.
          </li>
          <li>
            Choisis <strong>Request Only Memories</strong>, toute la période, puis Submit.
          </li>
          <li>
            Attends l&apos;email (quelques heures à plusieurs jours selon le volume).
          </li>
        </ol>
      </section>

      <section>
        <h2>Étape 2 — Télécharger tous les ZIP</h2>
        <p>
          Snapchat envoie souvent <strong>plusieurs fichiers</strong> (2 Go max par archive).
          Télécharge-les <strong>tous</strong> depuis le mail ou la section « Your exports » —
          les liens expirent en ~3 à 7 jours.
        </p>
        <p>
          Ne t&apos;arrête pas au fichier HTML dans le navigateur : il bugue sur les gros
          comptes. Les vrais médias sont dans le dossier <strong>memories/</strong> des ZIP.
        </p>
      </section>

      <section>
        <h2>Étape 3 — Importer dans SnapArchive</h2>
        <p>
          Sur{" "}
          <a href="/export">snap.webcooked.fr/export</a>, glisse{" "}
          <strong>tous tes ZIP d&apos;un coup</strong>. Pas besoin de les décompresser :
          SnapArchive trouve <code className="font-mono text-foreground">memories_history.json</code>{" "}
          et lit les photos directement dans les archives.
        </p>
        <ul>
          <li>Filtre par période ou preset « Hors 5 Go Snap »</li>
          <li>Dates EXIF + GPS restaurés sur les JPEG</li>
          <li>ZIP final trié par année / mois</li>
          <li>100 % local — rien n&apos;est uploadé sur nos serveurs</li>
        </ul>
      </section>

      <section>
        <h2>Erreurs fréquentes</h2>
        <ul>
          <li>
            <strong>JSON files oublié</strong> → pas de dates GPS ni de tri fiable.
          </li>
          <li>
            <strong>Un seul ZIP sur plusieurs</strong> → memories manquantes.
          </li>
          <li>
            <strong>Liens expirés</strong> → refais une demande d&apos;export sur Snapchat.
          </li>
          <li>
            <strong>Export sur iPhone uniquement</strong> → pour 1 000+ fichiers, passe par un
            ordinateur (RAM navigateur).
          </li>
        </ul>
      </section>
    </GuidePage>
  );
}
