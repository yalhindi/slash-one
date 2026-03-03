import { UserRepository } from './user.repository'
import { CreateUserInput, UpdateUserInput, UpdatePasswordInput } from './user.schema'
import bcrypt from 'bcryptjs'
import {Prisma, Role} from "@prisma/client";
import {ConflictError} from "@/core/errors/ConflictError";
import {NotFoundError} from "@/core/errors/NotFoundError";
import {UnauthorizedError} from "@/core/errors/UnauthorizedError";

export class UserService {
    /**
     * Création d'un utilisateur avec les règles métier
     */
    static async createUser(data: CreateUserInput) {
        // Règle métier : Unicité de l'email
        const emailExists = await UserRepository.existsByEmail(data.email)
        if (emailExists) {
            throw new ConflictError("USER.EMAIL_EXISTS")
        }

        // Règle métier : Unicité du pseudo
        const usernameExists = await UserRepository.existsByUsername(data.username)
        if (usernameExists) {
            throw new ConflictError("USER.USERNAME_EXISTS")
        }

        // Sécurité : Hachage du mot de passe
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(data.password, saltRounds)

        // Persistance : Appel au Repository pour écrire en base
        const newUser = await UserRepository.create({
            email: data.email,
            username: data.username,
            passwordHash: hashedPassword,
        })

        // Sécurité : Ne JAMAIS renvoyer le mot de passe (même haché) à l'API Front-end
        const { passwordHash, ...userWithoutPassword } = newUser

        return userWithoutPassword
    }

    /**
     * Récupère un utilisateur par son ID (sans son mot de passe)
     */
    static async getUserById(id: string) {
        const user = await UserRepository.findById(id)
        if (!user) {
            throw new NotFoundError("USER.NOT_FOUND")
        }
        const { passwordHash, ...userWithoutPassword } = user
        return userWithoutPassword
    }

    /**
     * Récupère les utilisateurs selon leur rôle
     */
    static async getUsersByRole(role: Role) {
        const users = await UserRepository.findByRole(role)
        // On retire les mots de passe de tous les utilisateurs de la liste
        return users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user
            return userWithoutPassword
        })
    }

    /**
     * Met à jour un utilisateur
     */
    static async updateUser(id: string, data: UpdateUserInput) {
        // Vérifier si l'utilisateur existe avant de tenter la mise à jour
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }

        // Préparer les données pour Prisma
        const prismaData: Prisma.UserUpdateInput = {
            email: data.email,
            username: data.username,
            avatarUrl: data.avatarUrl,
            countryCode: data.countryCode,
            dateOfBirth: data.dateOfBirth,
        }

        const updatedUser = await UserRepository.updateById(id, prismaData)
        const { passwordHash, ...userWithoutPassword } = updatedUser
        return userWithoutPassword
    }


    /**
     * Met à jour le mot de passe d'un utilisateur
     */
    static async updatePassword(id: string, data: UpdatePasswordInput) {

        // Récupérer l'utilisateur pour obtenir le hash actuel
        const user = await UserRepository.findById(id)
        if (!user) {
            throw new NotFoundError("USER.NOT_FOUND")
        }

        // Vérifier l'ancien mot de passe en comparant le texte en clair avec le hash
        const isPasswordValid = await bcrypt.compare(data.oldPassword, user.passwordHash)
        if (!isPasswordValid) {
            throw new UnauthorizedError("USER.INVALID_PASSWORD")
        }

        // Hacher le nouveau mot de passe avec un "salt" de 10 tours
        const saltRounds = 10
        const newPasswordHash = await bcrypt.hash(data.newPassword, saltRounds)

        //  Mettre à jour le mot de passe dans la base de données
        const updatedUser = await UserRepository.updateById(id, {
            passwordHash: newPasswordHash
        })

        // Nettoyer l'objet utilisateur avant de le renvoyer
        const { passwordHash, ...userWithoutPassword } = updatedUser
        return userWithoutPassword
    }

    /**
     * Supprime (Soft-delete) un utilisateur
     */
    static async deleteUser(id: string) {
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }

        const deletedUser = await UserRepository.softDeleteById(id)
        const { passwordHash, ...userWithoutPassword } = deletedUser
        return userWithoutPassword
    }

    /**
     * Supprime (Hard-delete) un utilisateur
     */
    static async hardDeleteUser(id: string) {
        const existingUser = await UserRepository.findById(id)
        if (!existingUser) {
            throw new NotFoundError("USER.NOT_FOUND")
        }

        const deletedUser = await UserRepository.hardDeleteById(id)
        const { passwordHash, ...userWithoutPassword } = deletedUser
        return userWithoutPassword
    }
}