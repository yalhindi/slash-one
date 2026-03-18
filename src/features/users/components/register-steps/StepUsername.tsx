"use client";

import { useFormContext, useFormState } from "react-hook-form";
import { useTranslations } from "@/hooks/use-translations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepUsername() {
    const t = useTranslations("Register");
    const tError = useTranslations(); // Le traducteur global pour Zod

    // On récupère le register et le control du parent
    const { register, control } = useFormContext();

    // On branche un écouteur d'état direct et forcé sur ce composant
    // On n'écoute QUE le "username".
    const { errors } = useFormState({ control, name: "username" });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300 block text-center uppercase tracking-wider text-xs font-bold">
                    {t("nameLabel")}
                </Label>

                <Input
                    id="username"
                    placeholder={t("namePlaceholder")}
                    className="text-center bg-slate-900/50 border-slate-700 text-white focus-visible:ring-blue-500"
                    {...register("username")}
                />

                {/* Le petit texte d'aide pour guider l'utilisateur */}
                <p className="text-center text-xs text-slate-500">{t("nameHelp")}</p>

                {/* L'affichage réactif de l'erreur */}
                {errors.username?.message && (
                    <p className="text-center text-sm text-red-500 font-medium">
                        {tError(String(errors.username.message))}
                    </p>
                )}
            </div>
        </div>
    );
}