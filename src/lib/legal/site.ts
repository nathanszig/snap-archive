import { DEFAULT_SITE_URL } from "@/lib/site-url";

/**
 * Legal metadata for SnapArchive.
 * Host: ask whoever manages the VPS for the datacenter provider name + address (LCEN).
 */
export const legalSite = {
  name: "SnapArchive",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  lastUpdated: "31 août 2026",
  editor: {
    fullName: "Nathan Szigeti",
    companyName: "Szigeti Nathan",
    legalForm: "Entrepreneur individuel (micro-entreprise)",
    siret: "108 521 550 00013",
    registrationDate: "30 août 2026",
    address: "12 Boulevard Oscar Thévenin, 95220 Herblay, France",
    email: "nathan.szigeti@hotmail.fr",
    publicationDirector: "Nathan Szigeti",
  },
  host: {
    name: "Infrastructure VPS (Dokploy)",
    address:
      "Serveur privé virtuel géré via Dokploy (infrastructure webcooked.fr). Nom et adresse du prestataire d'hébergement du datacenter : sur demande à nathan.szigeti@hotmail.fr.",
    website: "",
  },
} as const;

export function getHostDisplayLines(): string[] {
  const { name, address, website } = legalSite.host;
  const lines = [`${name} — ${address}`];
  if (website) lines.push(website);
  return lines;
}
