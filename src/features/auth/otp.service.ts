import { OtpRepository } from "./otp.repository"
import {UnauthorizedError} from "@/core/errors/UnauthorizedError";
import {CryptoUtils} from "@/utils/crypto";

export class OtpService {
    static async secureOtpRotation(email: string, currentToken: string): Promise<void> {

        /*
            TODO: Implémenter un système de Rate Limiting (Anti-Spam OTP / Brute Force)
                Règle métier : Vérifier combien de requêtes OTP ont été faites dans les 10 dernières minutes.
                Si count > 5 : Déclencher UserService.updateAccountStatus(email, 'SUSPENDED')
                et jeter une erreur pour bloquer l'envoi de l'email.
                (Nécessitera de modifier la stratégie de purge ci-dessous pour garder un historique temporaire).
        */

        // Nettoyage de sécurité : on invalide les anciens codes
        await OtpRepository.deletePreviousTokens(email, currentToken)
    }

    // Méthode de vérification
    static async consumeOtp(email: string, code: string) {

        // On crypte le code reçu du frontend
        const hashedCode = CryptoUtils.hashAuthToken(code);

        // On cherche le token haché dans la base !
        const verificationToken = await OtpRepository.findToken(email, hashedCode);

        if (!verificationToken) {
            throw new UnauthorizedError("AUTH.INVALID_OTP");
        }

        // Vérification de l'expiration
        if (verificationToken.expires < new Date()) {
            await OtpRepository.deleteToken(email, hashedCode); // On nettoie
            throw new UnauthorizedError("AUTH.EXPIRED_OTP");
        }

        // Le code est bon, on le détruit pour qu'il soit à usage unique
        await OtpRepository.deleteToken(email, hashedCode);

        return true;
    }
}