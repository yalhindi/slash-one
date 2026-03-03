import { prisma } from '@/lib/prisma'
import { Prisma, User, Role } from '@prisma/client'

export class UserRepository {
    // ==========================================
    // CREATE
    // ==========================================
    static async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
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

    static async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        })
    }

    static async findByRole(role: Role): Promise<User[]> {
        return prisma.user.findMany({
            where: {
                role,
                deletedAt: null // We only want active users
            },
        })
    }

    // ==========================================
    // READ (Exists / Booleans)
    // ==========================================
    static async existsByEmail(email: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { email },
        })
        return count > 0
    }

    static async existsByUsername(username: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { username },
        })
        return count > 0
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
     * Hard Delete
     */
    static async hardDeleteById(id: string): Promise<User> {
        // Suppression physique et irréversible de la base de données
        // Grâce à 'onDelete: Cascade' dans le schema.prisma, cela supprimera
        // automatiquement les profils liés (UserTrust, UserGlobalProfile, etc.)
        return prisma.user.delete({
            where: {id},
        })
    }
}