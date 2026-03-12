/*
  Warnings:

  - A unique constraint covering the columns `[chosen_digit,random_letters,random_digits,chosen_letter]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_username_random_digits_chosen_letter_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_chosen_digit_random_letters_random_digits_chosen_lett_key" ON "users"("chosen_digit", "random_letters", "random_digits", "chosen_letter");
