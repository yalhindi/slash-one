import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from './user.service'
import { UserRepository } from './user.repository'
import { ConflictError } from '@/core/errors/ConflictError'
import { Prisma, MembraneColor, Role, AccountStatus } from '@prisma/client'
import { CreateUserInput } from './user.schema'

// On "mock" (simule) uniquement le Repository
vi.mock('./user.repository')

describe('UserService', () => {

    // ==========================================
    // VARIABLES GLOBALES (Mocks allégés)
    // ==========================================
    const mockDbUser = {
        id: 'uuid-1234',
        email: 'test@slash.com',
        username: 'SlashGamer',
        chosenDigit: '9',
        chosenLetter: 'M',
        randomLetters: 'POZM',
        randomDigits: '931',
        membraneColor: MembraneColor.SINGULARITY,
        role: Role.USER,
        accountStatus: AccountStatus.ACTIVE,
        deletedAt: null
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ==========================================
    // TESTS : CREATE USER (Passwordless & Membrane)
    // ==========================================
    describe('createUser', () => {

        const mockInput: CreateUserInput = {
            email: 'test@slash.com',
            username: 'SlashGamer',
            chosenDigit: '9',
            chosenLetter: 'M',
            membraneColor: MembraneColor.SINGULARITY,
            bypassCertifiedWarning: false
        }

        it('devrait créer un utilisateur avec succès du premier coup', async () => {
            // ARRANGE 
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(false)
            vi.mocked(UserRepository.isUsernameCertified).mockResolvedValue(false)

            // On utilise "as never" pour bypasser le type strict de Prisma sur le mock
            vi.mocked(UserRepository.create).mockResolvedValue(mockDbUser as never)

            // ACT
            const result = await UserService.createUser(mockInput)

            // ASSERT
            expect(UserRepository.existsByEmail).toHaveBeenCalledWith(mockInput.email)
            expect(UserRepository.isUsernameCertified).toHaveBeenCalledWith(mockInput.username)
            expect(UserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: mockInput.email,
                    username: mockInput.username,
                    chosenDigit: mockInput.chosenDigit,
                    chosenLetter: mockInput.chosenLetter,
                    randomLetters: expect.any(String),
                    randomDigits: expect.any(String),
                    passportToken: expect.any(String)
                })
            )
            expect(UserRepository.create).toHaveBeenCalledOnce()

            expect(result.id).toBe(mockDbUser.id)
            expect(result.randomLetters).toBeDefined()
        })

        it('devrait jeter une ConflictError si l\'email existe déjà', async () => {
            // ARRANGE
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(true)

            // ACT & ASSERT
            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow(ConflictError)

            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow("USER.EMAIL_EXISTS")

            expect(UserRepository.create).not.toHaveBeenCalled()
        })

        it('devrait jeter une ConflictError si le nom est certifié et le bypass est faux', async () => {
            // ARRANGE 
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(false)
            vi.mocked(UserRepository.isUsernameCertified).mockResolvedValue(true)

            // ACT & ASSERT
            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow(ConflictError)

            await expect(UserService.createUser(mockInput))
                .rejects
                .toThrow("USER.CERTIFIED_NAME_WARNING")

            expect(UserRepository.create).not.toHaveBeenCalled()
        })

        it('devrait réussir si le nom est certifié mais que le bypass est à true', async () => {
            // ARRANGE
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(false)
            vi.mocked(UserRepository.isUsernameCertified).mockResolvedValue(true)

            vi.mocked(UserRepository.create).mockResolvedValue(mockDbUser as never)

            const bypassInput: CreateUserInput = { ...mockInput, bypassCertifiedWarning: true }

            // ACT
            const result = await UserService.createUser(bypassInput)

            // ASSERT
            expect(UserRepository.create).toHaveBeenCalledOnce()
            expect(result.id).toBe(mockDbUser.id)
        })

        it('devrait regénérer l\'ID et réussir si une collision (P2002) survient lors de la création', async () => {
            // ARRANGE
            vi.mocked(UserRepository.existsByEmail).mockResolvedValue(false)
            vi.mocked(UserRepository.isUsernameCertified).mockResolvedValue(false)

            const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: 'x.x.x'
            })

            vi.mocked(UserRepository.create)
                .mockRejectedValueOnce(prismaError)
                .mockResolvedValueOnce(mockDbUser as never)

            // ACT
            const result = await UserService.createUser(mockInput)

            // ASSERT
            expect(UserRepository.create).toHaveBeenCalledTimes(2)
            expect(result.id).toBe(mockDbUser.id)
        })
    })

    /*
        TODO : Les tests sur les autres méthodes de user.service
     */
})