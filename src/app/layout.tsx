import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
        <html lang="fr" className={cn("dark", "font-sans", geist.variable)}>
        <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen`}>
            {children}
            <Toaster theme="dark" position="top-center" richColors />
        </body>
        </html>
    );
}