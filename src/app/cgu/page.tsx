import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalSite } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — SnapArchive",
  description: "Conditions d'utilisation du service SnapArchive.",
};

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions générales d&apos;utilisation (« CGU ») régissent l&apos;accès
          et l&apos;utilisation du site {legalSite.name} ({legalSite.url}), édité par{" "}
          {legalSite.editor.fullName} ({legalSite.editor.companyName}).
        </p>
        <p>
          SnapArchive est un outil en ligne permettant de transformer un export officiel de
          Memories Snapchat en une archive ZIP organisée par date, avec options de métadonnées
          EXIF et de fusion d&apos;overlays photo.
        </p>
      </section>

      <section>
        <h2>2. Acceptation</h2>
        <p>
          En accédant au site ou en utilisant l&apos;outil d&apos;export, vous acceptez sans
          réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous devez
          cesser d&apos;utiliser le service.
        </p>
      </section>

      <section>
        <h2>3. Description du service</h2>
        <p>Le service est fourni « en l&apos;état » et comprend notamment :</p>
        <ul>
          <li>l&apos;import local d&apos;un fichier JSON ou ZIP issu de l&apos;export officiel Snapchat ;</li>
          <li>le filtrage par période et le téléchargement des médias depuis les liens fournis par Snapchat ;</li>
          <li>la génération d&apos;une archive ZIP triée, téléchargeable sur votre appareil ;</li>
          <li>des options facultatives (dates EXIF, coordonnées GPS, fusion d&apos;overlays photo).</li>
        </ul>
        <p>
          Le traitement est effectué <strong>dans votre navigateur</strong>. Aucun compte
          utilisateur n&apos;est requis pour la version actuelle du service.
        </p>
      </section>

      <section>
        <h2>4. Conditions d&apos;accès et prérequis</h2>
        <p>Pour utiliser SnapArchive, vous devez :</p>
        <ul>
          <li>disposer d&apos;un export officiel Snapchat valide (via « Mes données ») ;</li>
          <li>être titulaire des droits sur les contenus que vous importez, ou y être autorisé ;</li>
          <li>utiliser un navigateur récent compatible avec les API web modernes (File API, Canvas, etc.) ;</li>
          <li>respecter les conditions d&apos;utilisation de Snapchat pour vos propres données.</li>
        </ul>
        <p>
          Les liens de téléchargement fournis par Snapchat dans l&apos;export sont temporaires
          (souvent limités à quelques jours). L&apos;éditeur ne peut pas les régénérer ni
          garantir leur validité.
        </p>
      </section>

      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le site, son code, son design et sa documentation restent la propriété de
          l&apos;éditeur. Vos photos, vidéos et autres contenus Snapchat restent votre
          propriété — SnapArchive ne revendique aucun droit dessus.
        </p>
        <p>
          Snapchat®, Snap Inc. et les marques associées appartiennent à Snap Inc. SnapArchive
          n&apos;est pas affilié à Snap Inc.
        </p>
      </section>

      <section>
        <h2>6. Utilisations interdites</h2>
        <p>Il est notamment interdit de :</p>
        <ul>
          <li>utiliser le service pour traiter des contenus dont vous n&apos;êtes pas titulaire ou autorisé ;</li>
          <li>tenter de contourner les limitations techniques du site ou d&apos;attaquer son infrastructure ;</li>
          <li>revendre ou présenter le service comme un produit officiel Snapchat ;</li>
          <li>utiliser le service d&apos;une manière contraire à la loi ou aux droits de tiers.</li>
        </ul>
      </section>

      <section>
        <h2>7. Disponibilité et limites techniques</h2>
        <p>L&apos;éditeur s&apos;efforce d&apos;assurer la disponibilité du site, sans obligation
        de résultat. Le service peut être interrompu pour maintenance ou amélioration.</p>
        <p>Limites connues :</p>
        <ul>
          <li>volume de fichiers limité par la mémoire disponible dans votre navigateur ;</li>
          <li>échecs possibles de téléchargement (liens expirés, restrictions CORS côté Snapchat) ;</li>
          <li>fonctions EXIF / overlays limitées à certains types de fichiers (photos JPEG, etc.) ;</li>
          <li>overlays vidéo et fusion avancée non couverts par la version web actuelle.</li>
        </ul>
      </section>

      <section>
        <h2>8. Gratuité</h2>
        <p>
          La version actuelle de SnapArchive est proposée gratuitement, sans création de compte.
          L&apos;éditeur se réserve le droit d&apos;introduire ultérieurement des fonctionnalités
          payantes ou des limites d&apos;usage, avec information préalable sur le site.
        </p>
      </section>

      <section>
        <h2>9. Responsabilité</h2>
        <p>
          Vous êtes seul responsable des contenus que vous importez, des archives que vous
          générez et de leur usage. L&apos;éditeur ne peut être tenu responsable :
        </p>
        <ul>
          <li>de la perte de données due à la fermeture du navigateur, à une panne locale ou à un lien Snapchat expiré ;</li>
          <li>des dommages indirects (perte de données, perte d&apos;exploitation, etc.) ;</li>
          <li>de l&apos;usage que vous faites des fichiers exportés ;</li>
          <li>des évolutions ou restrictions imposées par Snap Inc. sur les exports ou CDN.</li>
        </ul>
        <p>
          En tant que consommateur, vous bénéficiez des garanties légales qui ne peuvent pas
          être exclues par les présentes CGU.
        </p>
      </section>

      <section>
        <h2>10. Données personnelles</h2>
        <p>
          Le traitement des données est décrit dans la{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>11. Liens et services tiers</h2>
        <p>
          Le site peut contenir des liens vers des ressources externes (documentation Snapchat,
          etc.). L&apos;éditeur n&apos;exerce aucun contrôle sur ces services tiers et décline
          toute responsabilité quant à leur contenu ou leurs pratiques.
        </p>
      </section>

      <section>
        <h2>12. Modification des CGU</h2>
        <p>
          Les CGU peuvent être modifiées à tout moment. La date de dernière mise à jour figure
          en tête de page. La poursuite de l&apos;utilisation du site après modification vaut
          acceptation des nouvelles conditions.
        </p>
      </section>

      <section>
        <h2>13. Droit applicable et litiges</h2>
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, une solution
          amiable sera recherchée en priorité en contactant{" "}
          <a href={`mailto:${legalSite.editor.email}`}>{legalSite.editor.email}</a>.
        </p>
        <p>
          À défaut, et sous réserve des règles impératives de protection des consommateurs,
          les tribunaux français seront compétents.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          {legalSite.editor.fullName} — {legalSite.editor.companyName}
          <br />
          {legalSite.editor.address}
          <br />
          <a href={`mailto:${legalSite.editor.email}`}>{legalSite.editor.email}</a>
        </p>
      </section>
    </LegalPage>
  );
}
