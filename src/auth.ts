import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import { randomInt } from "crypto"
import {UserService} from "@/features/users/user.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            // On personnalise la génération de l'OTP (par défaut c'est un token long, nous on veut 6 chiffres)
            generateVerificationToken() {
                // On génère un int entre 100000 et 999999
                const random = randomInt(100000, 1000000);
                return random.toString();
            },
        }),
    ],
    callbacks: {
        // Cette fonction est le "Videur" : elle s'exécute quand quelqu'un essaie de se connecter
        async signIn({ user }) {
            // RÈGLE MÉTIER CRUCIALE : On interdit à Auth.js de créer des comptes tout seul !
            // Si l'email n'existe pas dans notre table 'users', on refuse l'envoi de l'OTP.
            // La création DOIT passer par notre '/api/users/register'.
            // Le Service s'occupe de tout vérifier (Existence ET Statut)
            // S'il y a un problème, il jettera l'erreur lui-même et Auth.js la transmettra au Frontend
            await UserService.verifyLoginEligibility(user.email as string)

            return true // L'utilisateur existe, on autorise l'envoi de l'OTP !
        }
    }
})