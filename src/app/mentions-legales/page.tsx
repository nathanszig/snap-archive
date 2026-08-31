import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getHostDisplayLines, legalSite } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Mentions légales — SnapArchive",
  description: "Informations légales et identification de l'éditeur du site SnapArchive.",
};

export default function MentionsLegalesPage() {
  const hostLines = getHostDisplayLines();

  return (
    <LegalPage title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site {legalSite.name} ({legalSite.url}) est édité par :
        </p>
        <p>
          <strong>{legalSite.editor.fullName}</strong>
          <br />
          {legalSite.editor.companyName} — {legalSite.editor.legalForm}
          <br />
          SIRET : {legalSite.editor.siret}
          <br />
          Immatriculation : {legalSite.editor.registrationDate}
          <br />
          {legalSite.editor.address}
          <br />
          Email :{" "}
          <a href={`mailto:${legalSite.editor.email}`}>{legalSite.editor.email}</a>
        </p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>{legalSite.editor.publicationDirector}</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        {hostLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          Le site est déployé sur un serveur privé virtuel. Les fichiers statiques du site
          (pages, scripts) sont servis par cette infrastructure. Le traitement de vos
          fichiers Snapchat se fait exclusivement dans votre navigateur et n&apos;est pas
          hébergé sur nos serveurs.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du site (textes, graphismes, logo, code source) est protégé par le
          droit d&apos;auteur. Toute reproduction, représentation ou adaptation, totale ou
          partielle, sans autorisation écrite préalable de l&apos;éditeur est interdite.
        </p>
        <p>
          SnapArchive n&apos;est pas affilié, associé ou approuvé par Snap Inc. Snapchat et
          Memories sont des marques de Snap Inc.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Pour toute information relative au traitement des données, consultez notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>Conditions d&apos;utilisation</h2>
        <p>
          L&apos;utilisation du service est soumise aux{" "}
          <a href="/cgu">conditions générales d&apos;utilisation</a>.
        </p>
      </section>

      <section>
        <h2>Loi applicable</h2>
        <p>
          Le présent site est soumis au droit français. En cas de litige, et après tentative
          de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </section>
    </LegalPage>
  );
}
