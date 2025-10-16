# Pilulier : Mon Quotidien

Application React (Vite + Tailwind) avec assistant via proxy Netlify.

## Démarrage local
```bash
npm i
npm run dev
```

## Variables d'environnement
Créez un fichier `.env` à la racine :
```
ANTHROPIC_API_KEY=sk-xxxx
ANTHROPIC_VERSION=2023-06-01
```

## Déploiement Netlify
- Connectez le repo à Netlify.
- Build command: `npm run build`
- Publish: `dist`
- Functions: `netlify/functions`
- Le proxy est exposé à `/api/anthropic-proxy`.

## Scripts utiles
- `npm run dev` : serveur dev
- `npm run build` : build production
