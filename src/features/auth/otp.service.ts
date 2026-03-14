import { OtpRepository } from "./otp.repository"

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
}