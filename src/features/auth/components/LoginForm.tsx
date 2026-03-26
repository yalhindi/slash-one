"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useTranslations } from "@/hooks/use-translations";


export function LoginForm() {
    const router = useRouter();

    // Initialisation de i18n
    const t = useTranslations("Login");
    const tError = useTranslations();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Le schéma Zod est encapsulé dans useMemo pour accéder à t() sans re-rendus infinis
    const loginSchema = useMemo(() => z.object({
        email: z.email({ message: tError("VALIDATION.EMAIL_INVALID") }),
    }), [tError]);

    type LoginFormValues = z.infer<typeof loginSchema>;

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "" },
        mode: "onTouched",
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);

        try {
            // Appel au provider Nodemailer d'Auth.js pour envoyer l'OTP
            const result = await signIn("nodemailer", {
                email: data.email,
                redirect: false,
            });

            if (result?.error) {
                // NextAuth renverra une clé comme "USER.NOT_FOUND" ou "CredentialsSignin"
                toast.error(tError(result.error));
                setIsSubmitting(false);
                return;
            }

            toast.success(t("success"));

            // On redirige vers l'entonnoir OTP en passant l'email dans l'URL !
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);

        } catch (error) {
            // Sécurité en cas de crash réseau ou serveur (Tombe dans la clé générale)
            toast.error(tError("API.INTERNAL_SERVER_ERROR"));
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            <CardHeader className="text-center space-y-2">
                <Image
                    src="/slash-logo.png"
                    alt="Slash Logo"
                    width={64}
                    height={64}
                    priority
                    className="mx-auto mb-3 drop-shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                />
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {t("title")}
                </CardTitle>
                <CardDescription className="text-slate-400">
                    {t("description.part1")}<br/>
                    {t("description.part2")}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center py-4">
                    <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div  className="w-full flex flex-col items-center space-y-4">
                        <Label htmlFor="email" className="text-slate-200">{t("emailLabel")}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            {...register("email")}
                            className={`text-center bg-slate-900/50 border-slate-700 text-white focus-visible:ring-blue-500 ${
                                errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Button
                    type="submit"
                    form="login-form"
                    disabled={isSubmitting}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                >
                    {isSubmitting ? t("submitting") : t("submit")}
                </Button>

                <div className="text-center text-sm mt-2">
                    <span className="text-slate-400">{t("noAccount")} </span>
                    {/* Lien vers la page Register */}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                        {t("registerLink")}
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}