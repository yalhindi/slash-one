import { CredentialsSignin } from "next-auth";

/**
 * Classe spéciale pour faire le pont entre nos erreurs de domaine
 * et le système de sécurité de NextAuth v5.
 */
export class CustomAuthError extends CredentialsSignin {
    constructor(code: string) {
        super();
        this.code = code; // C'est cette propriété 'code' que NextAuth renvoie au Frontend

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomAuthError)
        }
    }
}