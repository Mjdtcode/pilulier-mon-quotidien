# Patch OpenAI — Pilulier : Mon Quotidien

## 1) Variables Netlify
- OPENAI_API_KEY = sk-...
- NODE_VERSION = 20

## 2) Fichiers ajoutés
- netlify/functions/openai-proxy.js
- public/_redirects  (ligne: `/api/openai /.netlify/functions/openai-proxy 200`)

## 3) Frontend
Dans votre composant de chat, remplacez l'appel `fetch('/api/anthropic-proxy', ...)` par l'appel fourni dans `src/components/Chatbot-openai-example.txt`.

## 4) Test local
npm i -g netlify-cli
netlify dev
curl -X POST http://localhost:8888/api/openai -H "Content-Type: application/json" -d "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"Bonjour\"}]}"

## 5) Déploiement
Commit + push, puis Netlify → Deploys → Clear cache and deploy site.
