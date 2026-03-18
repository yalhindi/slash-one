"use client";

import { useFormContext, useWatch, useFormState } from "react-hook-form";
import { useTranslations } from "@/hooks/use-translations";
import { Label } from "@/components/ui/label";

// Définition de nos 4 orbes avec leurs styles Tailwind spécifiques
const MEMBRANE_COLORS = [
    {
        value: "SINGULARITY",
        jsonKey: "singularity",
        gradient: "bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-900",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]"
    },
    {
        value: "PLASMA",
        jsonKey: "plasma",
        gradient: "bg-gradient-to-br from-pink-400 via-pink-600 to-rose-900",
        glow: "shadow-[0_0_20px_rgba(236,72,153,0.5)]"
    },
    {
        value: "BOREAL",
        jsonKey: "boreal",
        gradient: "bg-gradient-to-br from-teal-300 via-emerald-500 to-teal-900",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]"
    },
    {
        value: "FUSION",
        jsonKey: "fusion",
        gradient: "bg-gradient-to-br from-orange-400 via-orange-600 to-red-900",
        glow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]"
    }
] as const;

export function StepMembraneColor() {
    const t = useTranslations("Register");
    const tError = useTranslations();

    const { register, control } = useFormContext();

    // 1. On écoute la couleur choisie pour animer le bouton actif
    const selectedColor = useWatch({ control, name: "membraneColor" });

    // 2. L'espion pour les erreurs (si l'utilisateur clique sur Soumettre sans choisir)
    const { errors } = useFormState({ control, name: "membraneColor" });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-1">
                <Label className="text-slate-300 block text-center uppercase tracking-wider text-xs font-bold">
                    {t("colorLabel")}
                </Label>
                <p className="text-xs text-slate-500">{t("colorSubtitle")}</p>
            </div>

            {/* La grille des Orbes */}
            <div className="grid grid-cols-4 gap-4 mt-4">
                {MEMBRANE_COLORS.map((color) => {
                    const isSelected = selectedColor === color.value;

                    return (
                        <label
                            key={color.value}
                            className="flex flex-col items-center gap-3 cursor-pointer group"
                        >
                            {/* L'input radio est caché, mais garde toute sa fonctionnalité HTML/React */}
                            <input
                                type="radio"
                                value={color.value}
                                className="sr-only"
                                {...register("membraneColor")}
                            />

                            {/* Le rendu visuel de la Membrane (L'Orbe) */}
                            <div
                                className={`
                                    w-14 h-14 rounded-full transition-all duration-300 ease-out
                                    ${color.gradient}
                                    ${isSelected
                                        ? `scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950 ${color.glow}`
                                        : 'opacity-50 scale-95 hover:opacity-80 hover:scale-100 grayscale-[30%]'
                                    }
                `}
                            />

                            {/* Le nom de la couleur */}
                            <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                {t(`colors.${color.jsonKey}`)}
              </span>
                        </label>
                    );
                })}
            </div>

            {/* Affichage de l'erreur */}
            {errors.membraneColor?.message && (
                <p className="text-sm text-red-500 font-medium text-center mt-4">
                    {tError(String(errors.membraneColor.message))}
                </p>
            )}
        </div>
    );
}