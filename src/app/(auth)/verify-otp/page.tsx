import { redirect } from "next/navigation";
import { OtpForm } from "@/features/auth/components/OtpForm";

export default async function VerifyOtpPage({
                                                searchParams,
                                            }: {
    searchParams: Promise<{ email?: string }>;
}) {
    const params = await searchParams;
    const email = params.email;

    // Si l'URL ne contient pas d'email, on le renvoie à l'accueil
    if (!email) {
        redirect("/login");
    }

    return (
        <div className="relative w-full flex justify-center">
            <div className="w-full max-w-md">
                <OtpForm defaultEmail={email} />
            </div>
        </div>
    );
}