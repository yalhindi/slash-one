"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

import { useTranslations } from "@/hooks/use-translations";

export function OtpForm({ defaultEmail }: { defaultEmail: string }) {
    const router = useRouter();
    const t = useTranslations("Otp");     // Traductions locales de l'UI
    const tError = useTranslations();     // Traductions globales (Erreurs API depuis auth.ts)

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // On définit le schéma Zod *à l'intérieur* du composant
    // pour qu'il ait accès à la fonction de traduction 't'.
    // On utilise useMemo pour ne pas recréer le schéma à chaque rendu.
    const otpSchema = useMemo(() => z.object({
        code: z.string().length(6, { message: t("validation.length") }),
    }), [t]);

    type OtpFormValues = z.infer<typeof otpSchema>;

    const { handleSubmit, control, setValue, formState: { errors } } = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { code: "" },
    });

    // Écoute du code en temps réél
    const currentCode = useWatch({ control, name: "code" });

    const onSubmit = async (data: OtpFormValues) => {
        setIsSubmitting(true);

        const result = await signIn("credentials", {
            email: defaultEmail,
            code: data.code,
            redirect: false,
        });

        // On vide le code pour casser la boucle infinie !
        setValue("code", "");
        // On réactive le formulaire pour qu'il puisse retaper
        setIsSubmitting(false);

        // Si erreur, on affiche directement le toast et on s'arrête là (Early Exit).
        if (result?.error) {
            // result.error contiendra "USER.NOT_FOUND", "AUTH.MISSING_CREDENTIALS" ou "CredentialsSignin"
            toast.error(tError(result.error));
            return;
        }

        toast.success(t("success"));
        router.push("/passport");
    };

    // AUTO-SUBMIT : Déclenchement automatique au 6ème chiffre
    useEffect(() => {
        if (currentCode?.length === 6 && !isSubmitting) {
            handleSubmit(onSubmit)();
        }
    }, [currentCode, isSubmitting, handleSubmit]);


    const handleResend = async () => {
        if (!defaultEmail) return;

        setIsResending(true);

        const result = await signIn("nodemailer", {
            email: defaultEmail,
            redirect: false,
        });

        setIsResending(false);

        if (result?.error) {
            toast.error(tError(result.error) || t("resendError"));
            return;
        }

        toast.success(t("resendSuccess"));
    };

    return (
        <Card className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            <CardHeader className="text-center space-y-2">
                <Image
                    src="/slash-logo.png"
                    alt="Slash Logo"
                    width={64}
                    height={64}
                    priority // Charge cette image immédiatement (car elle est en haut de page)
                    className="mx-auto mb-3 drop-shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                />
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {t("title")}
                </CardTitle>
                <CardDescription className="text-slate-400">
                    {t("description")}
                    <br />
                    <span className="text-blue-400 font-medium">{defaultEmail}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center py-6">
                <form id="otp-form" onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center space-y-6">
                    <Controller
                        control={control}
                        name="code"
                        render={({ field }) => (
                            <InputOTP
                                maxLength={6}
                                pattern="^\d+$"
                                {...field}
                            >
                                <InputOTPGroup className="gap-2">
                                    <InputOTPSlot index={0} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                    <InputOTPSlot index={1} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                    <InputOTPSlot index={2} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                    <InputOTPSlot index={3} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                    <InputOTPSlot index={4} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                    <InputOTPSlot index={5} className="w-12 h-14 text-2xl font-mono bg-slate-950/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-md" />
                                </InputOTPGroup>
                            </InputOTP>
                        )}
                    />

                    {errors.code && (
                        <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-2">
                            {errors.code.message}
                        </p>
                    )}
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Button
                    type="submit"
                    form="otp-form"
                    disabled={isSubmitting}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                >
                    {isSubmitting ? t("submitting") : t("submit")}
                </Button>

                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || isSubmitting}
                        className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {isResending ? t("resending") : t("resend")}
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
}