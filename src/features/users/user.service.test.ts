import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from './user.service'
import { UserRepository } from './user.repository'
import { ConflictError } from '@/core/errors/ConflictError'
import { NotFoundError } from '@/core/errors/NotFoundError'

import bcrypt from 'bcryptjs'

// On "mock" (simule) le Repository et bcrypt
vi.mock('./user.repository')
vi.mock('bcryptjs')

describe('UserService', () => {

    // VARIABLE GLOBALE : L'utilisateur tel qu'il sort de la BDD
    // Réutilisable par tous les tests qui ont besoin d'un utilisateur existant
    const mockDbUser = {
        id: 'uuid-1234',
        email: 'test@slash.com',
        username: 'SlashGamer',
        passwordHash: 'hashed_password_mock',
        role: 'USER' as const,
        accountStatus: 'ACTIVE' as const,
        avatarUrl: null,
        dateOfBirth: null,
        countryCode: null,
        termsAcceptedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    // Une liste d'utilisateurs pour tester les requêtes multiples
    const mockDbUsersList = [
        mockDbUser, // USER
        {
            ...mockDbUser, // USER
            id: 'uuid-5678',
            email: 'test2@slash.com',
            username: 'SlashGamer2'
        },
        {
            ...mockDbUser,
            id: 'uuid-9999',
            email: 'admin@slash.com',
            username: 'SuperAdmin',
            role: 'ADMIN' as const // ADMIN
        }
    ]

    // Avant chaque test, on s'assure que nos compteurs de mocks sont remis à zéro
    beforeEach(() => {
        vi.clearAllMocks()
    })


    // --- TESTS POUR CREATE USER ---
    describe('createUser', () => {

        const mockInput = {
            email: 'test@slash.com',
            username: 'SlashGamer',
            password: 'Password123!'
        }

        it('devrait créer un utilisateur avec succès', async () => {
            // ARRANGE : On prépare le comportement de nos mocks
            // On simule que l'email et le username n'existent pas encore
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(false)
            vi.mocked(UserRepository.existsByUsername).mockResolvedValue(false)

            // On simule le hachage du mot de passe
            vi.mocked(bcrypt.hash as (data: string, salt: number) => Promise<string>).mockResolvedValue('hashed_password_mock')

            // On réutilise notre mock global pour simuler le retour de la BDD !
            vi.mocked(UserRepository.create).mockResolvedValue(mockDbUser)

            // ACT : On exécute la méthode de notre Service
            const result = await UserService.createUser(mockInput)

            // ASSERT : On vérifie que le résultat est conforme à nos attentes
            expect(UserRepository.existsByEmail).toHaveBeenCalledWith(mockInput.email)
            expect(bcrypt.hash).toHaveBeenCalledWith(mockInput.password, 10)

            // On vérifie que le mot de passe n'est PAS renvoyé dans le résultat
            expect(result).not.toHaveProperty('passwordHash')
            expect(result.id).toBe(mockDbUser.id)
        })

        it('devrait jeter une ConflictError si l\'email existe déjà', async () => {
            // ARRANGE : On simule que l'email existe déjà dans la BDD
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(true)

            // ACT & ASSERT : On s'attend à ce que la promesse soit rejetée avec notre erreur custom
            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow(ConflictError)

            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow("USER.EMAIL_EXISTS")

            // On vérifie que le repository n'a JAMAIS été appelé pour créer l'utilisateur
            expect(UserRepository.create).not.toHaveBeenCalled()
        })
    })

    // --- TESTS POUR GET USER BY ID ---
    describe('getUserById', () => {

        it('devrait retourner l\'utilisateur sans son mot de passe', async () => {
            // ARRANGE : On simule que le Repository trouve l'utilisateur
            vi.mocked(UserRepository.findById).mockResolvedValue(mockDbUser)

            // ACT : On appelle le service
            const result = await UserService.getUserById('uuid-1234')

            // ASSERT : On vérifie les appels et le nettoyage des données sensibles
            expect(UserRepository.findById).toHaveBeenCalledWith('uuid-1234')
            expect(result).not.toHaveProperty('passwordHash')
            expect(result.email).toBe(mockDbUser.email)
        })

        it('devrait jeter une NotFoundError si l\'utilisateur n\'existe pas', async () => {
            // ARRANGE : On simule que la base de données ne trouve rien
            vi.mocked(UserRepository.findById).mockResolvedValue(null)

            // ACT & ASSERT : On s'attend à ce que l'erreur personnalisée soit levée
            await expect(UserService.getUserById('fake-uuid'))
                .rejects
                .toThrow(NotFoundError)

            await expect(UserService.getUserById('fake-uuid'))
                .rejects
                .toThrow("USER.NOT_FOUND")
        })
    })

    // --- TEST POUR GET USERS BY ROLE ---
    describe('getUsersByRole', () => {

        it('devrait retourner la liste d\'utilisateurs d\'un certain rôle sans leurs mots de passe', async () => {
            // ARRANGE : On simule que le Repository trouve les utilisateurs avec le rôle USER
            const mockInputList = [mockDbUsersList[0], mockDbUsersList[1]]
            vi.mocked(UserRepository.findByRole).mockResolvedValue(mockInputList)

            // ACT : on appelle le service
            const result = await UserService.getUsersByRole('USER')

            // ASSERT : On vérifie les appels et le nettoyage des données sensibles
            expect(UserRepository.findByRole).toHaveBeenCalledWith('USER')
            expect(result).toHaveLength(2)

            expect(result[0]).not.toHaveProperty('passwordHash')
            expect(result[0].role).toBe('USER')

            expect(result[1]).not.toHaveProperty('passwordHash')
            expect(result[1].role).toBe('USER')
        })

        it('devrait retourner un tableau vide si aucun utilisateur ne correspond au rôle', async () => {
            // ARRANGE : On simule que le Repository ne trouve personne (renvoie un tableau vide)
            vi.mocked(UserRepository.findByRole).mockResolvedValue([])

            // ACT : On appelle le service en cherchant un rôle qui n'existe pas ou n'a pas d'utilisateurs
            const result = await UserService.getUsersByRole('ADMIN')

            // ASSERT :
            expect(UserRepository.findByRole).toHaveBeenCalledWith('ADMIN')
            expect(result).toBeInstanceOf(Array)
            expect(result).toHaveLength(0)
        })
    })

    // --- TESTS POUR UPDATE USER ---
    describe('updateUser', () => {
        // Un DTO de mise à jour partiel (l'utilisateur ne change que son pseudo et son pays)
        const updateData = {
            username: 'NouveauPseudo',
            countryCode: 'FR'
        }

        it('devrait mettre à jour le profil utilisateur avec succès', async () => {
            // ARRANGE :
            // On simule que l'utilisateur existe bien dans la BDD
            vi.mocked(UserRepository.findById).mockResolvedValue(mockDbUser)

            // On crée un faux retour de BDD avec les données mises à jour
            const updatedDbUser = { ...mockDbUser, username: 'NouveauPseudo', countryCode: 'FR' }
            vi.mocked(UserRepository.updateById).mockResolvedValue(updatedDbUser)

            // ACT : On appelle le Service
            const result = await UserService.updateUser('uuid-1234', updateData)

            // ASSERT :
            // Vérifier qu'on a bien cherché l'utilisateur d'abord
            expect(UserRepository.findById).toHaveBeenCalledWith('uuid-1234')

            // Vérifier que le mapping DTO → Prisma s'est bien passé
            expect(UserRepository.updateById).toHaveBeenCalledWith(
                'uuid-1234',
                expect.objectContaining({
                    username: 'NouveauPseudo',
                    countryCode: 'FR'
                })
            )

            // Vérifier la sécurité et le résultat renvoyé au contrôleur
            expect(result.username).toBe('NouveauPseudo')
            expect(result.countryCode).toBe('FR')
            expect(result).not.toHaveProperty('passwordHash')
        })

        it('devrait jeter une NotFoundError si l\'utilisateur à mettre à jour n\'existe pas', async () => {
            // ARRANGE : On simule que l'utilisateur est introuvable
            vi.mocked(UserRepository.findById).mockResolvedValue(null)

            // ACT & ASSERT : On s'attend à l'erreur
            await expect(UserService.updateUser('fake-id', updateData))
                .rejects
                .toThrow(NotFoundError)

            await expect(UserService.updateUser('fake-id', updateData))
                .rejects
                .toThrow("USER.NOT_FOUND")

            // On garantit que la base n'a pas été modifiée !
            expect(UserRepository.updateById).not.toHaveBeenCalled()
        })
    })
})