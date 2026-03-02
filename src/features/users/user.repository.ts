import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

export class UserRepository {
    /**
     * Crée un nouvel utilisateur
     */
    static async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        })
    }

    /**
     * Récupère un utilisateur via son ID (UUID)
     */
    static async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        })
    }

    /**
     * Récupère un utilisateur via son adresse email
     */
    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    /**
     * Récupère un utilisateur via son pseudo (username)
     */
    static async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        })
    }
}