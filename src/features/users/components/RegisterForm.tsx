"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/use-translations";
import Link from "next/link";
import Image from "next/image";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { createUserSchema } from "@/features/users/user.schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { StepEmail } from "./register-steps/StepEmail";
import { StepUsername } from "./register-steps/StepUsername";
import { StepFoundations } from "./register-steps/StepFoundations";
import { StepMembraneColor } from "./register-steps/StepMembraneColor";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type RegisterFormValues = z.input<typeof createUserSchema>;
const TOTAL_STEPS = 4;

export function RegisterForm() {
    const tReg = useTranslations("Register");
    const tError = useTranslations();
    const [currentStep, setCurrentStep] = useState(1);

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasCertifiedWarning, setHasCertifiedWarning] = useState(false);

    // Initialisation du Chef d'Orchestre (Mode onTouched pour la meilleure UX)
    const methods = useForm<RegisterFormValues>({
        resolver: zodResolver(createUserSchema),
        mode: "onTouched",
        defaultValues: {
            email: "",
            username: "",
            chosenDigit: "",
            chosenLetter: "",
            membraneColor: undefined,
            bypassCertifiedWarning: false,
        },
    });

    const { trigger, handleSubmit, control } = methods;

    // On écoute la couleur choisie pour la membrane
    const selectedColor = useWatch({
        control,
        name: "membraneColor",
    });

    // Navigation sécurisée (On valide avant d'avancer)
    const nextStep = async () => {
        let fieldsToValidate: (keyof RegisterFormValues)[] = [];
        if (currentStep === 1) fieldsToValidate = ["email"];
        if (currentStep === 2) fieldsToValidate = ["username"];
        if (currentStep === 3) fieldsToValidate = ["chosenDigit", "chosenLetter"];

        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            // On efface la mémoire des erreurs des étapes suivantes pour avoir une page propre
            if (currentStep === 1) methods.clearErrors("username");
            if (currentStep === 2) methods.clearErrors(["chosenDigit", "chosenLetter"]);
            if (currentStep === 3) methods.clearErrors("membraneColor");

            setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        }
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    // Soumission finale au Backend
    const onSubmit = async (data: RegisterFormValues) => {
        setIsSubmitting(true);
        setHasCertifiedWarning(false); // On réinitialise au cas où

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // --- GESTION DES ERREURS BACKEND ---
            if (!response.ok) {
                if (response.status === 400 && result.details) {
                    Object.keys(result.details).forEach((field) => {
                        methods.setError(field as keyof RegisterFormValues, {
                            type: "server",
                            message: result.details[field][0]
                        });
                    });
                    setCurrentStep(1);
                    return;
                }

                // Géstion de ConflictErrors
                if (response.status === 409) {
                    if (result.error === "USER.EMAIL_EXISTS") {
                        methods.setError("email", {
                            type: "server",
                            message: "USER.EMAIL_EXISTS" });
                        setCurrentStep(1);
                        return;
                    }

                    if (result.error === "USER.CERTIFIED_NAME_WARNING") {
                        // On déclenche l'affichage de l'alerte UI, et on arrête la fonction ici
                        setHasCertifiedWarning(true);
                        return;
                    }
                }

                // Pour TOUTES les autres erreurs (500, etc.)
                // On utilise la clé du back, on la traduit, et on utilise 'return' pour stopper la fonction.
                const fallbackError = result.error || "API.INTERNAL_SERVER_ERROR";
                toast.error(tError(fallbackError));
                return;
            }

            // --- SUCCÈS (201 Created) ---
            const signInResult = await signIn("nodemailer", {
                email: data.email,
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error(tError("AUTH.SEND_FAILED"));
                return;
            }

            // Redirection vers la saisie de l'OTP
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);

        } catch (error) {
            console.error("Crash critique :", error);
            toast.error(tError("API.INTERNAL_SERVER_ERROR"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Le fond dynamique (Aura spécifique à l'étape 4)
    const getBackgroundStyle = () => {
        // Si on n'est pas à la dernière étape ou sans couleur, on coupe l'Aura
        if (currentStep < 4 || !selectedColor) {
            return {
                backgroundImage: 'none',
                opacity: 0
            };
        }

        let gradient = "";
        if (selectedColor === "SINGULARITY") {
            // Violet Profond -> Violet Néon
            gradient = "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.45) 0%, rgba(168, 85, 247, 0.20) 40%)";
        } else if (selectedColor === "PLASMA") {
            // Magenta -> Rose Électrique
            gradient = "radial-gradient(circle at 50% 50%, rgba(219, 39, 119, 0.40) 0%, rgba(236, 72, 153, 0.18) 40%)";
        } else if (selectedColor === "BOREAL") {
            // Bleu Nuit -> Émeraude Éclatant
            gradient = "radial-gradient(circle at 50% 50%, rgba(10, 110, 80, 0.40) 0%, rgba(16, 185, 129, 0.15) 40%)";
        } else if (selectedColor === "FUSION") {
            // Cuivré Profond  -> Orange Intense
            gradient = "radial-gradient(circle at 50% 50%, rgba(184, 80, 20, 0.45) 0%, rgba(249, 115, 22, 0.20) 40%)";
        }

        return {
            backgroundImage: gradient,
            opacity: 1
        };
    };

    return (
        <div className="relative w-full flex justify-center">

            {/* L'Aura dynamique en position 'fixed'
                Elle couvre l'écran entier et passe derrière le formulaire (z-0)
            */}
            <div
                className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
                style={getBackgroundStyle()}
            />

            {/* La Carte du Formulaire (z-10 pour passer au-dessus de l'Aura) */}
            <div className="z-10 w-full max-w-md">
                <Card className="bg-slate-900/80 backdrop-blur-2xl border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
                    <CardHeader className="text-center space-y-2">
                        {/* ---  LOGO Slash --- */}
                        <Image
                            src="/slash-logo.png"
                            alt="Slash Logo"
                            width={64}
                            height={64}
                            priority    // Charge cette image immédiatement (car elle est en haut de page)
                            className="mx-auto mb-3 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]" // Centré, marge, et ombre portée légère
                        />
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">{tReg("title")}</CardTitle>
                        <CardDescription className="text-slate-400">{tReg("subtitle")}</CardDescription>
                        <div className="text-xs text-blue-400 font-medium tracking-widest uppercase pt-2 transition-all">
                            {tReg("stepProgress", { current: currentStep, total: TOTAL_STEPS })}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* FormProvider partage la mémoire aux enfants */}
                        <FormProvider {...methods}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                // On bloque le comportement du navigateur par défaut de soumettre la totalité du formulaire instantanément
                                // si on appuie sur la touche "Enter".
                                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                className="py-4 min-h-[120px] relative"
                            >
                                {currentStep === 1 && <StepEmail />}
                                {currentStep === 2 && <StepUsername />}
                                {currentStep === 3 && <StepFoundations />}
                                {currentStep === 4 && <StepMembraneColor />}
                            </form>
                        </FormProvider>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        {/* --- ZONE D'ALERTE : NOM CERTIFIÉ --- */}
                        {hasCertifiedWarning && (
                            <div className="w-full p-4 mb-2 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-in fade-in zoom-in duration-300">
                                <p className="text-sm text-amber-500/90 text-center font-medium leading-relaxed">
                                    {tError("USER.CERTIFIED_NAME_WARNING")}
                                </p>
                                <p className="text-sm text-amber-500/90 text-center font-medium leading-relaxed">
                                    {tError("USER.CERTIFIED_NAME_VALIDATE_QUESTION")}
                                </p>
                            </div>
                        )}

                        <div className="flex w-full gap-4 mt-2">
                            {/* SI L'ALERTE EST AFFICHÉE : Boutons spécifiques */}
                            {hasCertifiedWarning ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        // S'il refuse, on le renvoie à l'étape 2 et on cache l'alerte
                                        onClick={() => {
                                            setHasCertifiedWarning(false);
                                            setCurrentStep(2);
                                        }}
                                        className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        {tReg("actions.modify_name")}
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            // S'il valide, on met le bypass à true, et on relance la soumission !
                                            methods.setValue("bypassCertifiedWarning", true);
                                            handleSubmit(onSubmit)();
                                        }}
                                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                                    >
                                        {isSubmitting ? tReg("actions.submitting") : tReg("actions.validate_name")}
                                    </Button>
                                </>
                            ) : (
                                /* SI PAS D'ALERTE : Boutons normaux */
                                <>
                                    {/* Le bouton Retour n'existe que si on a passé l'étape 1 */}
                                    {currentStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                           className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                                        >
                                            {tReg("actions.back")}
                                        </Button>
                                    )}

                                    {/* Le bouton Suivant ou Soumettre */}
                                    {currentStep < TOTAL_STEPS ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex-1 bg-blue-700 hover:bg-blue-600 text-white"
                                        >
                                            {tReg("actions.next")}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-blue-700 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? tReg("actions.submitting") : tReg("actions.submit")}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        {!hasCertifiedWarning && (
                            <div className="text-center text-sm mt-2">
                                <span className="text-slate-400">{tReg("alreadyHaveAccountPt1")}</span>
                                {/* Lien vers la page Login */}
                                <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    {tReg("alreadyHaveAccountPt2")}
                                </Link>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}