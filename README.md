# SnapArchive (`snap-export`)

Outil web **100% client-side** pour transformer l'export officiel Snapchat
(`memories_history.json`) en archive ZIP triée par date.

## Pourquoi

Snapchat limite les Memories gratuites à 5 Go et supprime l'excédent après 12 mois.
L'export officiel est pénible (HTML bugué, milliers de ZIP). SnapArchive automatise
le téléchargement depuis les liens CDN + organisation `YYYY/MM/`.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · JSZip · fflate

## Dev local

```powershell
cd snap-export
npm install
npm run dev
```

Ouvre http://localhost:3000

## Build prod (Dokploy)

Type de build : **Dockerfile** (standalone Next.js).

Variables d'env : aucune obligatoire pour le MVP.

## Flux utilisateur

1. Export Snapchat sur accounts.snapchat.com (`Export your Memories` + `Export JSON files`)
2. Upload `memories_history.json` ou ZIP mydata sur `/export`
3. Filtre par période
4. Téléchargement ZIP local

## Limites v2

- Overlays **vidéo** et fusion de fragments → v3 desktop
- EXIF GPS sur MP4 non supporté (photos JPG/PNG converties oui)
- Liens Snapchat expirent (~7 jours)
- Gros comptes → limite RAM navigateur

## Roadmap

- [x] EXIF dates + GPS (JPEG)
- [x] Fusion overlays photos
- [ ] Overlays vidéo (ffmpeg.wasm ou Tauri)
- [ ] Merge fragments vidéo
- [ ] App desktop Tauri pour gros volumes
- [ ] Freemium Stripe (>500 snaps)
