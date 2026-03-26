import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// On initialise NextAuth ICI avec la config "légère" (sans Prisma/Node)
const { auth } = NextAuth(authConfig);

// On liste nos routes publiques (accessibles sans être connecté)
const publicRoutes = ["/", "/login", "/register", "/verify-otp"];

// On exporte la fonction middleware "enveloppée" par NextAuth
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Est-ce que la route actuelle est liée à l'API d'authentification ? (Crucial de les laisser passer)
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

    // Est-ce que la route actuelle est dans notre liste publique ?
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    // --- RÈGLES DE SÉCURITÉ ---

    // On ne bloque jamais les requêtes internes de NextAuth
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // Un utilisateur connecté ne doit pas pouvoir retourner sur Login/Register
    if (isPublicRoute && isLoggedIn && nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/passport", nextUrl));
    }

    // Le Videur ! Si la route n'est pas publique et qu'on n'est pas connecté ➔ Dehors !
    if (!isLoggedIn && !isPublicRoute) {
        // On peut même garder en mémoire la page qu'il essayait de visiter pour le rediriger plus tard
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    // Si tout est en ordre, on laisse passer la requête
    return NextResponse.next();
});

// Le Matcher (Filtre de performance)
// On dit à Next.js de ne PAS exécuter ce middleware sur les fichiers statiques (images, css)
// pour ne pas ralentir l'application inutilement.
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)"],
};