import { z } from 'zod'
import { REGEX } from '@/utils/regex'

export const createUserSchema = z.object({
    email: z.email("VALIDATION.EMAIL_INVALID").max(255),
    username: z.string()
        .min(3, "VALIDATION.USERNAME_TOO_SHORT")
        .max(30, "VALIDATION.USERNAME_TOO_LONG")
        .regex(REGEX.USERNAME, "VALIDATION.USERNAME_INVALID"),
    password: z.string()
        .min(8, "VALIDATION.PASSWORD_TOO_SHORT")
        .max(255, "VALIDATION.PASSWORD_TOO_LONG")
        .regex(REGEX.PASSWORD, "VALIDATION.PASSWORD_INVALID")
})

export const updateUserSchema = z.object({
    email: z.email("VALIDATION.EMAIL_INVALID").max(255).optional(),
    username: z.string().min(3).max(30).regex(REGEX.USERNAME).optional(),
    avatarUrl: z.url("VALIDATION.URL_INVALID").optional(),
    countryCode: z.string().length(2, "VALIDATION.COUNTRY_CODE_INVALID").optional(),
    dateOfBirth: z.date().optional()
})

export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "VALIDATION.REQUIRED"),
    newPassword: z.string()
        .min(8, "VALIDATION.PASSWORD_TOO_SHORT")
        .max(255, "VALIDATION.PASSWORD_TOO_LONG")
        .regex(REGEX.PASSWORD, "VALIDATION.PASSWORD_INVALID"),
    confirmNewPassword: z.string().min(1, "VALIDATION.REQUIRED")
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "VALIDATION.PASSWORDS_DO_NOT_MATCH",
    path: ["confirmNewPassword"],
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>