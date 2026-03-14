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
}