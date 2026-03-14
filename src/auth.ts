import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Nodemailer from "next-auth/providers/nodemailer"
import { prisma } from "@/lib/prisma"
import { randomInt } from "crypto"
import {UserService} from "@/features/users/user.service";
import { createTransport } from "nodemailer";
import {OtpService} from "@/features/auth/otp.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,

            // Le code expire au bout de 10 minutes (600 secondes)
            maxAge: 10 * 60,

            // On personnalise la génération de l'OTP (par défaut c'est un token long, nous on veut 6 chiffres)
            generateVerificationToken() {
                // On génère un int entre 100000 et 999999
                const random = randomInt(100000, 1000000);
                return random.toString();
            },

            // Override la méthode pour customiser l'email
            async sendVerificationRequest({ identifier, provider, token }) {
                // Sécurité métier : On purge la base de données des anciens codes liés à cet email.
                // Cela garantit qu'un seul OTP (le nouveau) est actif à la fois (Token Rotation).
                await OtpService.secureOtpRotation(identifier, token)

                // Initialisation du client SMTP (Nodemailer) avec les identifiants configurés dans le provider (Mailtrap)
                const transport = createTransport(provider.server)

                // On envoie l'email avec notre propre design HTML
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Votre code d'accès Slash : ${token}`,
                    text: `Votre code d'accès est : ${token}`, // Version texte brut (fallback)
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; border-radius: 10px;">
                          <h1 style="color: #111827; text-align: center;">Initialisation de la Membrane</h1>
                          <p style="color: #4b5563; font-size: 16px; text-align: center;">
                            Bienvenue sur le MegaHub. Voici votre code de sécurité unique pour autoriser l'accès :
                          </p>
                          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 1px solid #e5e7eb;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">
                              ${token}
                            </span>
                          </div>
                          <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
                          </p>
                        </div>
                      `,
                })

                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Impossible d'envoyer l'email à (${failed.join(", ")})`)
                }
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