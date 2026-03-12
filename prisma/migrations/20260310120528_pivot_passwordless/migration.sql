/*
  Warnings:

  - You are about to drop the column `has_passkey` on the `user_trusts` table. All the data in the column will be lost.
  - You are about to drop the column `is_kyc_verified` on the `user_trusts` table. All the data in the column will be lost.
  - You are about to drop the column `is_world_id_verified` on the `user_trusts` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `VarChar(14)`.
  - You are about to drop the `User_global_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cartridge_serial]` on the table `user_trusts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,random_digits,chosen_letter]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `games` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `chosen_digit` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chosen_letter` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `random_digits` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `random_letters` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembraneColor" AS ENUM ('SINGULARITY', 'PLASMA', 'BOREAL', 'FUSION');

-- CreateEnum
CREATE TYPE "AuthenticatorTransport" AS ENUM ('INTERNAL', 'USB', 'NFC', 'BLE', 'HYBRID');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('SINGLE_DEVICE', 'MULTI_DEVICE');

-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('FPS', 'MOBA', 'SANDBOX', 'RPG');

-- DropForeignKey
ALTER TABLE "User_global_profiles" DROP CONSTRAINT "User_global_profiles_user_id_fkey";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "category",
ADD COLUMN     "category" "GameCategory" NOT NULL;

-- AlterTable
ALTER TABLE "linked_accounts" ADD COLUMN     "cached_profile_data" JSONB,
ADD COLUMN     "last_synced_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "user_trusts" DROP COLUMN "has_passkey",
DROP COLUMN "is_kyc_verified",
DROP COLUMN "is_world_id_verified",
ADD COLUMN     "cartridge_serial" TEXT,
ADD COLUMN     "is_humanity_verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
ADD COLUMN     "chosen_digit" CHAR(1) NOT NULL,
ADD COLUMN     "chosen_letter" CHAR(1) NOT NULL,
ADD COLUMN     "free_name_change_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_certified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name_change_date" TIMESTAMPTZ,
ADD COLUMN     "membrane_color" "MembraneColor" NOT NULL DEFAULT 'SINGULARITY',
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "random_digits" CHAR(3) NOT NULL,
ADD COLUMN     "random_letters" CHAR(4) NOT NULL,
ALTER COLUMN "username" SET DATA TYPE VARCHAR(14);

-- DropTable
DROP TABLE "User_global_profiles";

-- CreateTable
CREATE TABLE "otp_requests" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "passkeys" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "transports" "AuthenticatorTransport"[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_global_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "global_xp" INTEGER NOT NULL DEFAULT 0,
    "last_hub_login" TIMESTAMPTZ,

    CONSTRAINT "user_global_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_credential_id_key" ON "passkeys"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_global_profiles_user_id_key" ON "user_global_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_trusts_cartridge_serial_key" ON "user_trusts"("cartridge_serial");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_random_digits_chosen_letter_key" ON "users"("username", "random_digits", "chosen_letter");

-- AddForeignKey
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_global_profiles" ADD CONSTRAINT "user_global_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
