import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalSite } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité — SnapArchive",
  description:
    "Comment SnapArchive traite vos données : traitement 100 % local, sans upload serveur.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          {legalSite.editor.fullName} — {legalSite.editor.companyName}
          <br />
          {legalSite.editor.address}
          <br />
          Email :{" "}
          <a href={`mailto:${legalSite.editor.email}`}>{legalSite.editor.email}</a>
        </p>
      </section>

      <section>
        <h2>2. Principe fondamental : traitement local</h2>
        <p>
          SnapArchive est conçu pour traiter vos données <strong>uniquement dans votre
          navigateur</strong>. Lorsque vous importez un export Snapchat (
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
            memories_history.json
          </code>{" "}
          ou archive ZIP), vos photos, vidéos et métadonnées :
        </p>
        <ul>
          <li>ne sont <strong>pas envoyées</strong> sur nos serveurs ;</li>
          <li>ne sont <strong>pas stockées</strong> par l&apos;éditeur ;</li>
          <li>restent sur votre appareil pendant le traitement, puis sont effacées de la
          mémoire du navigateur lorsque vous fermez l&apos;onglet (sauf données locales
          décrites ci-dessous).</li>
        </ul>
        <p>
          Les téléchargements depuis les liens CDN Snapchat (fournis dans votre export
          officiel) s&apos;effectuent <strong>directement entre votre navigateur et les
          serveurs de Snap Inc.</strong> Nous n&apos;interceptons ni ne conservons ces flux.
        </p>
      </section>

      <section>
        <h2>3. Données traitées localement</h2>
        <p>Dans le cadre normal de l&apos;outil, les données suivantes peuvent transiter
        par votre navigateur :</p>
        <ul>
          <li>fichiers multimédias de vos Memories (photos, vidéos) ;</li>
          <li>métadonnées associées (dates, localisations GPS si présentes dans l&apos;export) ;</li>
          <li>URLs de téléchargement temporaires fournies par Snapchat dans l&apos;export.</li>
        </ul>
        <p>
          Ces données servent uniquement à générer l&apos;archive ZIP que vous téléchargez.
          Nous n&apos;en conservons aucune copie.
        </p>
      </section>

      <section>
        <h2>4. Stockage local (localStorage)</h2>
        <p>
          Si vous utilisez la fonction « Ne perds pas le fil », nous enregistrons
          localement dans votre navigateur (via{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
            localStorage
          </code>
          ) :
        </p>
        <ul>
          <li>la date à laquelle vous avez indiqué avoir demandé un export Snapchat ;</li>
          <li>éventuellement la date de fermeture de la bannière de rappel.</li>
        </ul>
        <p>
          Clé utilisée :{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
            snaparchive-pending-export
          </code>
          . Durée maximale d&apos;affichage du rappel : 14 jours. Vous pouvez supprimer ces
          données à tout moment en vidant le stockage local du site dans les paramètres de
          votre navigateur.
        </p>
        <p>
          Les rappels calendrier (.ics) et notifications navigateur, s&apos;ils sont activés,
          sont générés ou planifiés localement — aucune donnée n&apos;est transmise à nos
          serveurs pour ces fonctionnalités.
        </p>
      </section>

      <section>
        <h2>5. Cookies et mesure d&apos;audience</h2>
        <p>
          SnapArchive utilise <strong>Umami</strong> (
          <a
            href="https://analytics.webcooked.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            analytics.webcooked.fr
          </a>
          ), hébergé par l&apos;éditeur, pour mesurer l&apos;audience du site : pages
          consultées, pays, type d&apos;appareil, source de trafic.
        </p>
        <ul>
          <li>
            <strong>Sans cookies</strong> — Umami ne dépose pas de cookie publicitaire ni de
            cookie de suivi cross-site ;
          </li>
          <li>
            <strong>Données agrégées</strong> — aucune photo, vidéo ou export Snapchat n&apos;est
            transmis ;
          </li>
          <li>
            <strong>Pas de revente</strong> — les statistiques servent uniquement à améliorer le
            service.
          </li>
        </ul>
        <p>
          Tu peux bloquer ce script via ton bloqueur de publicités ou les paramètres de ton
          navigateur sans impact sur l&apos;outil d&apos;export (100 % local).
        </p>
      </section>

      <section>
        <h2>6. Base légale et finalités</h2>
        <p>
          Le traitement local de vos fichiers repose sur votre <strong>action volontaire</strong>{" "}
          (import du fichier) et l&apos;<strong>exécution du service</strong> que vous
          demandez (organisation de votre export en archive ZIP).
        </p>
        <p>
          Le stockage local du rappel repose sur votre <strong>consentement</strong>, matérialisé
          par l&apos;activation explicite de la fonction « Ne perds pas le fil ».
        </p>
      </section>

      <section>
        <h2>7. Destinataires et transferts</h2>
        <p>
          Aucune donnée personnelle n&apos;est transmise à l&apos;éditeur via l&apos;outil
          d&apos;export. Seuls des échanges directs entre votre navigateur et Snap Inc.
          (téléchargement des médias) peuvent avoir lieu, selon les liens présents dans
          votre export officiel.
        </p>
      </section>

      <section>
        <h2>8. Durée de conservation</h2>
        <ul>
          <li>
            <strong>Fichiers importés</strong> : aucune conservation côté éditeur ; durée
            limitée à votre session navigateur.
          </li>
          <li>
            <strong>Rappel localStorage</strong> : 14 jours maximum, ou jusqu&apos;à
            suppression manuelle.
          </li>
          <li>
            <strong>Emails de contact</strong> : le temps de traiter votre demande, puis
            suppression ou archivage selon obligation légale.
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement (UE) 2016/679, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès</strong> et <strong>rectification</strong> ;</li>
          <li><strong>Effacement</strong> ;</li>
          <li><strong>Limitation</strong> et <strong>opposition</strong> au traitement ;</li>
          <li><strong>Portabilité</strong>, lorsque applicable.</li>
        </ul>
        <p>
          Comme nous ne collectons pas vos fichiers Snapchat, la plupart de ces droits se
          exercent directement depuis votre navigateur (suppression du stockage local) ou en
          nous contactant pour toute demande relative à un échange par email.
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a href={`mailto:${legalSite.editor.email}`}>{legalSite.editor.email}</a>
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            cnil.fr
          </a>
          ).
        </p>
      </section>

      <section>
        <h2>10. Sécurité</h2>
        <p>
          Le site est servi en HTTPS. La sécurité de vos fichiers dépend aussi de votre
          appareil et de votre navigateur : utilisez un poste de confiance et une version
          à jour de votre navigateur pour traiter des contenus personnels.
        </p>
      </section>

      <section>
        <h2>11. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. La date en tête de page indique la dernière
          révision. En cas de changement substantiel, une mention visible pourra être ajoutée
          sur le site.
        </p>
      </section>
    </LegalPage>
  );
}
