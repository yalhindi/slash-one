"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/use-translations";
import Link from "next/link";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createUserSchema } from "@/features/users/user.schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { StepEmail } from "./register-steps/StepEmail";
import { StepUsername } from "./register-steps/StepUsername";
import { StepFoundations } from "./register-steps/StepFoundations";
import { StepMembraneColor } from "./register-steps/StepMembraneColor";

type RegisterFormValues = z.input<typeof createUserSchema>;
const TOTAL_STEPS = 4;

export function RegisterForm() {
    const t = useTranslations("Register");
    const [currentStep, setCurrentStep] = useState(1);

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
    const onSubmit = (data: RegisterFormValues) => {
        console.log("Données validées prêtes pour le backend :", data);
    };

    // Le fond dynamique (Bleu nuit par défaut, puis Aura spécifique à l'étape 4)
    const getBackgroundStyle = () => {
        if (currentStep < 4 || !selectedColor) {
            return {
                backgroundImage: 'linear-gradient(to bottom right, #020617, #082f49, #020617)',
                opacity: 1
            };
        }

        let gradient = "";
        if (selectedColor === "SINGULARITY") {
            gradient = "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, rgba(88, 28, 135, 0.5) 50%, #020617 100%)";
        } else if (selectedColor === "PLASMA") {
            gradient = "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.25) 0%, rgba(159, 18, 57, 0.5) 50%, #020617 100%)";
        } else if (selectedColor === "BOREAL") {
            gradient = "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, rgba(30, 58, 138, 0.5) 50%, #020617 100%)";
        } else if (selectedColor === "FUSION") {
            gradient = "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.25) 0%, rgba(153, 27, 27, 0.5) 50%, #020617 100%)";
        }

        return {
            backgroundImage: gradient,
            opacity: 1
        };
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">

            {/* Le Halo subtil en arrière-plan */}
            <div
                className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none"
                style={getBackgroundStyle()}
            />

            <Card className="z-10 w-full max-w-md bg-slate-950/70 backdrop-blur-2xl border-white/10 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">{t("title")}</CardTitle>
                    <CardDescription className="text-slate-400">{t("subtitle")}</CardDescription>
                    <div className="text-xs text-blue-400 font-medium tracking-widest uppercase pt-2 transition-all">
                        {t("stepProgress", { current: currentStep, total: TOTAL_STEPS })}
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
                    <div className="flex w-full gap-4 mt-2">
                        {/* Le bouton Retour n'existe que si on a passé l'étape 1 */}
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                            >
                                {t("actions.back")}
                            </Button>
                        )}

                        {/* Le bouton Suivant ou Soumettre */}
                        {currentStep < TOTAL_STEPS ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {t("actions.next")}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                                {t("actions.submit")}
                            </Button>
                        )}
                    </div>

                    <div className="text-center text-sm mt-2">
                        <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                            {t("alreadyHaveAccount")}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}