"use client";

import { useFormContext, useFormState} from "react-hook-form";
import { useTranslations } from "@/hooks/use-translations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepEmail() {
    // t pour l'interface UI (bloqué dans "Register")
    const t = useTranslations("Register");

    // tError sans paramètre (part de la racine pour lire "VALIDATION.EMAIL_INVALID")
    const tError = useTranslations();

    // On récupère juste le register et le 'control' du contexte
    const { register, control } = useFormContext();

    // On branche un écouteur d'état direct et forcé sur ce composant
    // On n'écoute QUE l'email !
    const { errors } = useFormState({ control, name: "email" });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 block text-center uppercase tracking-wider text-xs font-bold">
                    {t("emailLabel")}
                </Label>

                <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className=" text-center bg-slate-900/50 border-slate-700 text-white focus-visible:ring-blue-500"
                    {...register("email")}
                />

                {/* On utilise tError pour traduire le message brut renvoyé par Zod ! */}
                {errors.email?.message && (
                    <p className="text-center text-sm text-red-500 font-medium">
                        {tError(String(errors.email.message))}
                    </p>
                )}
            </div>
        </div>
    );
}