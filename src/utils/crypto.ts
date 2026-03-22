import { createHash } from "crypto";

export class CryptoUtils {
    /**
     * Reproduit l'algorithme de hachage des tokens d'Auth.js v5.
     * @param token Le code OTP en clair (ex: "123456")
     * @returns Le token haché tel qu'il est stocké dans la base de données
     */
    static hashAuthToken(token: string): string {
        const secret = process.env.AUTH_SECRET;

        if (!secret) {
            throw new Error("Critical Error : AUTH_SECRET is missing in .env file");
        }

        // La recette secrète d'Auth.js : SHA-256(token + secret)
        return createHash("sha256")
            .update(`${token}${secret}`)
            .digest("hex");
    }
}