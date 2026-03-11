// features/users/user.schema.ts
import { z } from 'zod'
import { MembraneColor } from '@prisma/client'
import {REGEX} from "@/utils/regex";

export const createUserSchema = z.object({
    email: z.email("VALIDATION.EMAIL_INVALID").max(255),

    // Règle : Uniquement des lettres (avec accents français inclus), max 14 caractères
    username: z.string()
        .min(2, "VALIDATION.USERNAME_TOO_SHORT")
        .max(14, "VALIDATION.USERNAME_TOO_LONG")
        .regex(REGEX.USERNAME, "VALIDATION.USERNAME_LETTERS_ONLY"),

    // Règle : Un chiffre choisi (0-9)
    chosenDigit: z.string().
        length(1)
        .regex(REGEX.CHOSEN_DIGIT, "VALIDATION.DIGIT_INVALID"),

    // Règle : Une lettre choisie (A-Z, on force la majuscule)
    chosenLetter: z.string()
        .length(1)
        .regex(REGEX.CHOSEN_LETTER, "VALIDATION.LETTER_INVALID")
        .toUpperCase(),

    // Règle : 4 couleurs de Membrane possibles
    membraneColor: z.enum(MembraneColor, {
        message: "VALIDATION.COLOR_INVALID"
    }),

    // Flag pour la règle métier "Nom Certifié" (Soft Block)
    bypassCertifiedWarning: z.boolean().optional().default(false)
})

export const updateUserSchema = z.object({
    email: z.email("VALIDATION.EMAIL_INVALID").max(255).optional(),
    phoneNumber: z.string().regex(REGEX.PHONE_NUMBER, "VALIDATION.PHONE_INVALID").optional(),
    avatarUrl: z.url("VALIDATION.URL_INVALID").optional(),
    countryCode: z.string().length(2, "VALIDATION.COUNTRY_CODE_INVALID").toUpperCase().optional(),
    dateOfBirth: z.date().max(new Date(), "VALIDATION.DOB_IN_FUTURE").optional()
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>