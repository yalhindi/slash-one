import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// On personnalise le SEO
export const metadata: Metadata = {
    title: "Slash - ONE",
    description: "Écosystème gaming centralisé et gestion de la Membrane (SLSH ID).",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="dark">
        <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen`}>
            {children}
        </body>
        </html>
    );
}