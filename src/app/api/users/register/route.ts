import { NextResponse } from 'next/server'
import { createUserSchema } from '@/features/users/user.schema'
import { UserService } from '@/features/users/user.service'
import { ConflictError } from '@/core/errors/ConflictError'
import { z } from 'zod'

export async function POST(request: Request) {
    try {
        // Récupération de la requête du Frontend
        const body = await request.json()

        // Validation de sécurité (Zod)
        // parse() jette une erreur automatiquement si les données ne respectent pas le schéma
        const validatedData = createUserSchema.parse(body)

        // Appel à notre Service Métier
        const newUser = await UserService.createUser(validatedData)

        // Succès : On renvoie l'utilisateur créé avec un code HTTP 201 (Created)
        return NextResponse.json(
            {
                message: 'Membrane created successfully',
                user: newUser
            },
            { status: 201 }
        )

    } catch (error) {
        // --- GESTION CENTRALISÉE DES ERREURS ---

        // Erreur de saisi utilisateur (Zod a bloqué)
        if (error instanceof z.ZodError) {
            // Extraction manuelle des erreurs pour le Frontend
            const fieldErrors: Record<string, string[]> = {}

            error.issues.forEach((issue) => {
                // path[0] contient le nom du champ (ex: "email" ou "username")
                const fieldName = String(issue.path[0])

                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = []
                }
                
                if (!fieldErrors[fieldName].includes(issue.message)) {
                    fieldErrors[fieldName].push(issue.message)
                }
            })

            return NextResponse.json(
                { error: 'VALIDATION_FAILED', details: fieldErrors },
                { status: 400 } // Bad Request
            )
        }

        // Erreur métier (Notre UserService a jeté une ConflictError)
        // ex: "USER.EMAIL_EXISTS" ou "USER.CERTIFIED_NAME_WARNING"
        if (error instanceof ConflictError) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 } // Conflict
            )
        }

        // Erreur système inattendue (Base de données en panne, etc.)
        console.error('[POST /api/users/register] FATAL ERROR:', error)
        return NextResponse.json(
            { error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 } // Internal Server Error
        )
    }
}