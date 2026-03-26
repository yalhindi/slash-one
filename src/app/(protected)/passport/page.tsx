import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Cette page est un Server Component (composant serveur)
export default async function PassportPage() {
    // Récupération de la session utilisateur directement sur le serveur
    const session = await auth();

    // Vérifier la présence de l'utilisateur.
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4">

            {/* Petit fond basique pour la page en construction */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to bottom right, #020617, #0f172a, #020617)' }}
            />

            <Card className="z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl border-white/10 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <Image
                        src="/slash-logo.png"
                        alt="Slash Logo"
                        width={64}
                        height={64}
                        priority
                        // Effet visuel "en travaux" (désaturé et un peu transparent)
                        className="mx-auto mb-3"
                    />
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Passeport Digital
                    </CardTitle>
                    <CardDescription className="text-blue-400 font-medium animate-pulse">
                        Terminal en cours de construction...
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-inner overflow-x-auto">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                            <p className="text-slate-400 text-sm font-mono">
                                // Objet Session (Payload)
                            </p>
                            <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800/50">
                Connecté
              </span>
                        </div>

                        {/* On affiche les données brutes de l'utilisateur */}
                        <pre className="text-blue-300 font-mono text-sm leading-relaxed">
              {JSON.stringify(session.user, null, 2)}
            </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}