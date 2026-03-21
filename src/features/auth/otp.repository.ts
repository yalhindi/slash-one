import { prisma } from "@/lib/prisma"

export class OtpRepository {
    // Supprime tous les jetons d'un email, sauf celui qu'on vient de générer
    static async deletePreviousTokens(identifier: string, currentToken: string) {
        return prisma.verificationToken.deleteMany({
            where: {
                identifier: identifier,
                token: { not: currentToken }
            }
        })
    }

    // Récupérer un token précis
    static async findToken(identifier: string, token: string) {
        return prisma.verificationToken.findFirst({
            where: { identifier, token }
        })
    }

    // Supprimer un token (après utilisation ou expiration)
    static async deleteToken(identifier: string, token: string) {
        return prisma.verificationToken.deleteMany({
            where: { identifier, token }
        })
    }
}