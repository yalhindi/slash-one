"use client";

import { useFormContext, useFormState } from "react-hook-form";
import { useTranslations } from "@/hooks/use-translations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepFoundations() {
    const t = useTranslations("Register");
    const tError = useTranslations();

    const { register, control } = useFormContext();

    // On écoute le "chosenDigit" et le "chosenLetter".
    const { errors: digitErrors } = useFormState({ control, name: "chosenDigit" });
    const { errors: letterErrors } = useFormState({ control, name: "chosenLetter" });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* L'Avertissement d'irréversibilité */}
            <div className="p-3 bg-amber-500/10 rounded-md border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <p className="text-xs text-amber-500/90 font-medium text-center uppercase tracking-wide">
                    {t("irreversibleWarning")}
                </p>
            </div>

            {/* Les deux champs côte à côte */}
            <div className="grid grid-cols-2 gap-6">

                {/* CHAMP : CHIFFRE */}
                <div className="space-y-2">
                    <Label htmlFor="chosenDigit" className="text-slate-300 block text-center uppercase tracking-wider text-xs font-bold">
                        {t("digitLabel")}
                    </Label>
                    <Input
                        id="chosenDigit"
                        maxLength={1} // BLOQUE à 1 seul caractère
                        inputMode="numeric" // FORCE le clavier numérique sur mobile
                        placeholder="0-9"
                        className="bg-slate-900/80 border-slate-700 text-white text-center text-3xl h-16 font-mono focus-visible:ring-blue-500 placeholder:text-slate-700"
                        {...register("chosenDigit")}
                    />
                    {digitErrors.chosenDigit?.message && (
                        <p className="text-xs text-red-500 font-medium text-center">
                            {tError(String(digitErrors.chosenDigit.message))}
                        </p>
                    )}
                </div>

                {/* CHAMP : LETTRE */}
                <div className="space-y-2">
                    <Label htmlFor="chosenLetter" className="text-slate-300 block text-center uppercase tracking-wider text-xs font-bold">
                        {t("letterLabel")}
                    </Label>
                    <Input
                        id="chosenLetter"
                        maxLength={1} // BLOQUE à 1 seul caractère
                        placeholder="A-Z"
                        // uppercase transforme visuellement la lettre en majuscule instantanément
                        className="bg-slate-900/80 border-slate-700 text-white text-center text-3xl h-16 font-mono uppercase focus-visible:ring-blue-500 placeholder:text-slate-700"
                        {...register("chosenLetter")}
                    />
                    {letterErrors.chosenLetter?.message && (
                        <p className="text-xs text-red-500 font-medium text-center">
                            {tError(String(letterErrors.chosenLetter.message))}
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}