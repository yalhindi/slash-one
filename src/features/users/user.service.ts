import { UserRepository } from './user.repository'
import { CreateUserInput, UpdateUserInput } from './user.schema'
import { Prisma, Role } from '@prisma/client'
import { ConflictError } from '@/core/errors/ConflictError'
import { NotFoundError } from '@/core/errors/NotFoundError'
import crypto from 'crypto'

export class UserService {
    // ==========================================
    // UTILS : Générateurs pour le SLSH ID
    // ==========================================
    private static generateRandomLetters(length: number = 4): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    private static generateRandomDigits(length: number = 3): string {
        let result = ''
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString()
        }
        return result
    }

    // ==========================================
    // CRÉATION D'UTILISATEUR (La Membrane)
    // ==========================================
    static async createUser(data: CreateUserInput) {
        // Vérifications métier préalables (Exécutées en parallèle pour des performances optimales)
        const [emailExists, isCertified] = await Promise.all([
            UserRepository.existsByEmail(data.email),
            UserRepository.isUsernameCertified(data.username)
        ])

        if (emailExists) {
            throw new ConflictError("USER.EMAIL_EXISTS")
        }

        if (isCertified && !data.bypassCertifiedWarning) {
            // Déclenche un avertissement côté front si le nom appartient à une personnalité publique
            throw new ConflictError("USER.CERTIFIED_NAME_WARNING")
        }

        // Préparation des données statiques de l'utilisateur
        const passportToken = crypto.randomUUID()
        const MAX_ATTEMPTS = 3
        let attempts = 0

        // Tente d'insérer l'utilisateur. En cas de collision rarissime sur l'entropie du SLSH ID (Erreur P2002),
        // la boucle intercepte l'erreur et regénère les fragments aléatoires de manière transparente.
        while (attempts < MAX_ATTEMPTS) {
            try {
                // Génération des fragments aléatoires du SLSH ID
                const randomLetters = this.generateRandomLetters(4)
                const randomDigits = this.generateRandomDigits(3)

                const newUser = await UserRepository.create({
                    email: data.email,
                    username: data.username,
                    chosenDigit: data.chosenDigit,
                    chosenLetter: data.chosenLetter,
                    membraneColor: data.membraneColor,
                    randomLetters,
                    randomDigits,
                    passportToken
                })

                return newUser

            } catch (error) {
                // Interception spécifique de la violation de contrainte d'unicité
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    attempts++
                    // On laisse simplement la boucle passer à l'itération suivante.
                    // Si attempts == MAX_ATTEMPTS, la condition du while deviendra fausse.
                    continue
                }

                // Relais de toute autre erreur inattendue
                throw error
            }
        }

        //si on arrive ici, c'est obligatoirement que la boucle a échoué 3 fois consécutives et s'est terminée.
        throw new ConflictError("USER.SLSH_ID_GENERATION_FAILED")
    }

    // ==========================================
    // LECTURE
    // ==========================================
    static async getUserById(id: string) {
        const user = await UserRepository.findById(id)
        if (!user) {
            throw new NotFoundError("USER.NOT_FOUND")
        }
        return user
    }

    static async getUsersByRole(role: Role) {
        return await UserRepository.findByRole(role)
    }

    // ==========================================
    // MISE À JOUR
    // ==========================================
    static async updateUser(id: string, data: UpdateUserInput) {
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }

        // Préparer les données pour Prisma
        const prismaData: Prisma.UserUpdateInput = {
            email: data.email,
            phoneNumber: data.phoneNumber,
            avatarUrl: data.avatarUrl,
            countryCode: data.countryCode,
            dateOfBirth: data.dateOfBirth,
        }

        return await UserRepository.updateById(id, prismaData)
    }

    // ==========================================
    // SUPPRESSION
    // ==========================================
    static async deleteUser(id: string) {
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }
        return await UserRepository.softDeleteById(id)
    }

    static async hardDeleteUser(id: string) {
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }
        return await UserRepository.hardDeleteById(id)
    }
}