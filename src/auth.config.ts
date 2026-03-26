import type { NextAuthConfig } from "next-auth";

// Cette configuration légère est la seule chose que le Middleware a le droit de lire
export const authConfig = {
    session: { strategy: "jwt" },
    providers: [], // On laisse vide ici, le Middleware n'en a pas besoin pour lire un cookie !
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig;