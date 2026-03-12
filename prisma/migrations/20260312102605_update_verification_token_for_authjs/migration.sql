/*
  Warnings:

  - The primary key for the `otp_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email,code]` on the table `otp_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "otp_requests" DROP CONSTRAINT "otp_requests_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "otp_requests_email_code_key" ON "otp_requests"("email", "code");
