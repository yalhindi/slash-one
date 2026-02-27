-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "country_code" VARCHAR(2),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "terms_accepted_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_trusts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "has_passkey" BOOLEAN NOT NULL DEFAULT false,
    "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_world_id_verified" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_trusts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_passports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "unique_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_scanned_at" TIMESTAMPTZ,

    CONSTRAINT "public_passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform_id" UUID NOT NULL,
    "external_account_id" TEXT NOT NULL,
    "access_token" TEXT,
    "linked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linked_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_global_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "global_xp" INTEGER NOT NULL DEFAULT 0,
    "last_hub_login" TIMESTAMPTZ,

    CONSTRAINT "User_global_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cover_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_servers" (
    "id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "game_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "season_name" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_server_progressions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "server_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "ranked_points" INTEGER NOT NULL DEFAULT 0,
    "last_activity" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_server_progressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_trusts_user_id_key" ON "user_trusts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_passports_user_id_key" ON "public_passports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_passports_unique_token_key" ON "public_passports"("unique_token");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "linked_accounts_user_id_platform_id_key" ON "linked_accounts"("user_id", "platform_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_global_profiles_user_id_key" ON "User_global_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "games_name_key" ON "games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "game_server_progressions_user_id_server_id_season_id_key" ON "game_server_progressions"("user_id", "server_id", "season_id");

-- AddForeignKey
ALTER TABLE "user_trusts" ADD CONSTRAINT "user_trusts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_passports" ADD CONSTRAINT "public_passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_global_profiles" ADD CONSTRAINT "User_global_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_servers" ADD CONSTRAINT "game_servers_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_server_progressions" ADD CONSTRAINT "game_server_progressions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_server_progressions" ADD CONSTRAINT "game_server_progressions_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "game_servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_server_progressions" ADD CONSTRAINT "game_server_progressions_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
