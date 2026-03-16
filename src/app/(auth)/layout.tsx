import React from "react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#082f49] to-[#020617] p-4">

            {children}

        </div>
    );
}