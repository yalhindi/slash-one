import { prisma } from '@/lib/prisma'
import { Prisma, User, Role } from '@prisma/client'

// On crée un type spécifique pour l'entrée du Repository afin de forcer
// le Service à envoyer les données atomiques de la Membrane, tout en
// laissant le Repository gérer la création des profils liés.
type CreateUserPayload = Omit<Prisma.UserCreateInput, 'trustProfile' | 'globalProfile' | 'publicPassport'> & {
    passportToken: string;
}

export class UserRepository {

    // ==========================================
    // CREATE (Avec Nested Writes / Transactions)
    // ==========================================
    static async create(data: CreateUserPayload) {
        // On extrait le passportToken du reste des données pour Prisma
        const { passportToken, ...userData } = data;

        return prisma.user.create({
            data: {
                ...userData,

                trustProfile: {
                    create: {
                        isHumanityVerified: false
                    }
                },

                globalProfile: {
                    create: {
                        globalXp: 0
                    }
                },

                publicPassport: {
                    create: {
                        uniqueToken: passportToken,
                        isActive: true
                    }
                }
            },
            include: {
                trustProfile: true,
                globalProfile: true,
                publicPassport: true
            }
        })
    }

    // ==========================================
    // READ (Find)
    // ==========================================
    static async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        })
    }

    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    // Recherche par l'Identifiant Social Public (ex: "Neo 931 M")
    // Attention : Cette méthode peut renvoyer des doublons (homonymes).
    // La différenciation visuelle (couleur/avatar) sera gérée côté client.
    static async findBySocialId(username: string, randomDigits: string, chosenLetter: string) {
        return prisma.user.findMany({
            where: {
                username: username,
                randomDigits: randomDigits,
                chosenLetter: chosenLetter
            }
        })
    }

    static async findByRole(role: Role): Promise<User[]> {
        return prisma.user.findMany({
            where: {
                role,
                deletedAt: null // Seulement les utilisateurs actifs
            },
        })
    }

    // ==========================================
    // READ (Règles Métier & Vérifications)
    // ==========================================
    static async existsByEmail(email: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { email },
        })
        return count > 0
    }


    // Vérifier si le nom appartient à une personnalité publique
    static async isUsernameCertified(username: string): Promise<boolean> {
        const certifiedUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: 'insensitive' // Recherche insensible à la casse
                },
                isCertified: true
            }
        })
        return certifiedUser !== null
    }


    static async getAccountStatus(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { accountStatus: true }
        })
        return user?.accountStatus || null
    }

    // ==========================================
    // UPDATE & DELETE
    // ==========================================
    static async updateById(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        })
    }

    /**
     * Soft Delete
     */
    static async softDeleteById(id: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                accountStatus: 'SUSPENDED'
            },
        })
    }

    /**
     * Hard Delete (Droit à l'oubli RGPD)
     */
    static async hardDeleteById(id: string): Promise<User> {
        // La suppression physique ('onDelete: Cascade' dans Prisma) détruit
        // automatiquement le UserTrust, UserGlobalProfile, les Passkeys liés ect.
        return prisma.user.delete({
            where: { id },
        })
    }
}