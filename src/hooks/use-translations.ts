import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

// Pour l'instant, on force le dictionnaire français
// (on pourra plus tard le rendre dynamique en lisant le localStorage ou le navigateur du client).
const currentDictionary = fr;

export function useTranslations(namespace: keyof typeof currentDictionary) {

    // Cette fonction va lire des clés comme "actions.next" ou "title".
    return function t(path: string): string {
        const keys = path.split('.'); // Sépare "actions.next" en ["actions", "next"]

        // On part du bloc sélectionné (ex: "Register")
        let result: unknown = currentDictionary[namespace];

        // On parcourt l'objet JSON en profondeur
        for (const key of keys) {
            // On s'assure que 'result' est bien un objet non nul avant de chercher une clé dedans
            if (typeof result === 'object' && result !== null && key in result) {
                // On indique temporairement à TS que c'est un objet avec des clés (Record)
                result = (result as Record<string, unknown>)[key];
            } else {
                console.warn(`Traduction manquante pour la clé : ${namespace}.${path}`);
                return path; // Fallback : on affiche la clé brute si non trouvée
            }
        }

        // On s'assure de bien renvoyer un string à la fin
        return typeof result === 'string' ? result : path;
    };
}