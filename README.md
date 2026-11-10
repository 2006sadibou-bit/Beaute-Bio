# Beaute-bio — Étapes 1 à 7

Ce dossier contient :
- La structure de base du projet Next.js (TypeScript + Tailwind)
- La configuration Supabase (client + serveur)
- Le script SQL complet (`supabase/schema.sql`) avec toutes les tables et les RLS
- Le bucket Storage pour les images produits (`supabase/storage.sql`)
- La page catalogue `/produits` connectée à Supabase

## Pour démarrer sur ton ordinateur

1. Installer Node.js (version 18 ou plus) si pas déjà fait.
2. Ouvrir un terminal dans ce dossier et lancer :
   ```
   npm install
   ```
3. Créer un compte sur https://supabase.com et créer un nouveau projet.
4. Dans Supabase > SQL Editor, coller tout le contenu de `supabase/schema.sql` et l'exécuter.
   Puis faire la même chose avec `supabase/storage.sql` (crée le bucket d'images).
5. Dans Supabase > Project Settings > API, copier :
   - Project URL
   - anon public key
6. Copier `.env.local.example` en `.env.local` et remplir avec ces deux valeurs.
7. Lancer le site :
   ```
   npm run dev
   ```
8. Ouvrir http://localhost:3000

## Ce qui est déjà en place
- Page d'accueil basique (à styliser davantage à l'étape "page d'accueil")
- Fichier de config centralisé (`lib/config.ts`) pour WhatsApp et Wave
- Types TypeScript pour toutes les tables
- Clients Supabase (navigateur + serveur)

## Comment ajouter un produit pour tester
Dans Supabase > Table Editor > products, ajoute une ligne (name, slug, description, price, stock, active=true).
Pour la photo : Storage > product-images > upload, puis copie l'URL publique dans `image_url`.

## Prochaine étape
Page détail produit (`/produits/[slug]`) + panier.
