# Projet ONE - MegaHub (Slash)

Bienvenue sur le dépôt du projet ONE, l'écosystème centralisé permettant de récolter et lier les progressions des joueurs sur différents serveurs de jeux (Minecraft, etc.).

## Stack Technique
- Framework : Next.js 15+ (App Router, React Compiler activé)
- Langage : TypeScript
- Style : Tailwind CSS v4
- ORM : Prisma v7.4+ (avec adaptateur natif pg)
- Base de données : PostgreSQL (via Docker)
- Authentification : Auth.js v5 (NextAuth) - Approche Passwordless (OTP / Mailtrap)
- Validation des données : Zod
- Architecture : N-Tiers orientée Feature (Vertical Slicing)
- Tests Unitaires : Vitest (avec interface UI)

---

## Installation locale (Onboarding)

### 1. Prérequis
- Node.js (v20+ recommandé)
- Docker Desktop (doit être lancé en arrière-plan)
- IDE recommandé : WebStorm ou VS Code

### 2. Cloner et installer les dépendances

```bash
git clone https://github.com/yalhindi/slash-one.git
cd slash-one
npm install
```

### 3. Variables d'environnement
Créez un fichier `.env` à la racine du projet en vous basant sur le fichier `.env.example` fourni. Ce fichier `.env` est ignoré par Git pour des raisons de sécurité.
Voici la structure attendue :

```env
# --- 1. Base de données (PostgreSQL via Docker) ---
POSTGRES_USER="local_user"
POSTGRES_PASSWORD="local_password"
POSTGRES_DB="local_db"
DATABASE_URL="postgresql://local_user:local_password@localhost:5432/local_db?schema=public"

# --- 2. Authentification (Auth.js) ---
AUTH_URL="http://localhost:3000"
# Générez une clé secrète avec : openssl rand -base64 32 ou npx auth secret
AUTH_SECRET="votre_cle_secrete"

# --- 3. Email Provider (Mailtrap pour le développement) ---
EMAIL_SERVER_USER="identifiant_mailtrap"
EMAIL_SERVER_PASSWORD="mot_de_passe_mailtrap"
EMAIL_SERVER_HOST="sandbox.smtp.mailtrap.io"
EMAIL_SERVER_PORT="2525"
EMAIL_FROM="noreply@slash.xyz"
```

### 4. Lancer la Base de Données (Docker)
Assurez-vous que Docker Desktop tourne, puis montez le conteneur PostgreSQL :

```bash
docker compose up -d
```
Le conteneur expose la base sur le port 5432 de la machine hôte.

### 5. Initialiser Prisma (ORM)
Comme nous utilisons Prisma 7, la configuration de connexion est gérée dynamiquement dans `src/lib/prisma.ts`.
Générez le client TypeScript et appliquez les migrations à la base fraichement créée :

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```
L'application est maintenant accessible sur http://localhost:3000.

---

### 7. Lancer les tests unitaires
Le projet utilise Vitest pour garantir la fiabilité de la logique métier. Les tests ciblent spécifiquement la couche Service en isolant complètement la base de données (via des mocks), respectant ainsi la séparation des préoccupations. 

Pour exécuter les tests en ligne de commande (en mode surveillance / watch) :

```bash
npm run test
```

Pour ouvrir le tableau de bord interactif de Vitest dans votre navigateur :

```bash
npm run test:ui
```

## Architecture du projet
Le code métier est séparé des routes Next.js pour respecter une architecture N-Tiers (Controllers → Services → Repositories) :
- `src/app/` : Routage Next.js (Front-end UI, API Controllers et routes Catch-All d'authentification).
- `src/features/` : Modules métiers (ex: `users/`, `progressions/`) contenant la logique (`.service.ts`), la validation stricte avec Zod (`.schema.ts`) et l'accès BDD (`.repository.ts`).
- `src/core/` : Logique transverse (Sécurité, Middlewares globaux).
- `src/lib/` : Configuration technique et clients externes (ex: `prisma.ts`).
- `src/auth.ts` : Configuration centrale du moteur de sécurité (NextAuth / Auth.js) et de l'authentification Passwordless.
