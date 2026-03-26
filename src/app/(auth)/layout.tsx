import React from "react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(to bottom right, #020617, #082f49, #020617)'
            }}
        >
            {/* Les formulaires viendront s'injecter ici, par-dessus ce fond de base */}
            <div className="z-10 w-full flex justify-center p-4">
                {children}
            </div>
        </div>
    );
}