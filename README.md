# Projet ONE - MegaHub (Slash)

Bienvenue sur le depot du projet ONE, l'ecosysteme centralise permettant de recolter et lier les progressions de joueurs sur differents serveurs de jeux (Minecraft, etc.).

## Stack Technique
- Framework : Next.js 15+ (App Router, React Compiler active)
- Langage : TypeScript
- Style : Tailwind CSS v4
- ORM : Prisma v7.4+ (avec adaptateur natif pg)
- Base de donnees : PostgreSQL (via Docker)
- Architecture : N-Tiers orientee Feature (Vertical Slicing)

---

## Installation locale (Onboarding)

### 1. Prerequis
- Node.js (v20+ recommande)
- Docker Desktop (doit etre lance en arriere-plan)
- IDE recommande : WebStorm ou VS Code

### 2. Cloner et installer les dependances

```bash
git clone https://github.com/yalhindi/slash-one.git
cd slash-one
npm install
```

### 3. Variables d'environnement
Creez un fichier `.env` a la racine du projet. Ce fichier est ignoré par Git pour des raisons de securite.
Utilisez la structure suivante :

```env
# Remplacer "local_user", "local_password" et "local_db" par vos propre valeurs
POSTGRES_USER="local_user"
POSTGRES_PASSWORD="local_password"
POSTGRES_DB="local_db"

# URL de connexion pour Prisma (utilise les variables ci-dessus)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
```

### 4. Lancer la Base de Donnees (Docker)
Assurez-vous que Docker Desktop tourne, puis montez le conteneur PostgreSQL :

```bash
docker compose up -d
```
Le conteneur expose la base sur le port 5432 de la machine hote.

### 5. Initialiser Prisma (ORM)
Comme nous utilisons Prisma 7, la configuration de connexion est geree dynamiquement dans `src/lib/prisma.ts`.
Generez le client TypeScript et appliquez les migrations à la base fraichement creee :

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Lancer le serveur de developpement

```bash
npm run dev
```
L'application est maintenant accessible sur http://localhost:3000.

---

## Architecture du projet
Le code metier est separe des routes Next.js pour respecter une architecture N-Tiers (Controllers → Services → Repositories) :
- `src/app/` : Routage Next.js (Front-end UI et API Controllers).
- `src/features/` : Modules metiers (ex: `users/`, `progressions/`) contenant la logique (`.service.ts`) et l'accès BDD (`.repository.ts`).
- `src/core/` : Logique transverse (Securite, Middlewares).
- `src/lib/` : Configuration technique (ex: `prisma.ts`).