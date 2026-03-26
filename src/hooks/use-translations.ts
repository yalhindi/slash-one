import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

// Pour l'instant, on force le dictionnaire français
// (on pourra plus tard le rendre dynamique en lisant le localStorage ou le navigateur du client
// ou en donnant le choix de changer la langue à l'utilisateur).
const currentDictionary = fr;

export function useTranslations(namespace?: keyof typeof currentDictionary) {

    // Cette fonction va lire des clés comme "actions.next" ou "title".
    return function t(path: string, options?: Record<string, string | number>): string {
        const keys = path.split('.'); // Sépare "actions.next" en ["actions", "next"]

        // Si on a un namespace, on part de lui (ex: "Register"). Sinon, on part de la racine globale !
        let result: unknown = namespace ? currentDictionary[namespace] : currentDictionary;

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
        let text = typeof result === 'string' ? result : path;

        // Si on a passé des variables, on les remplace dans le texte !
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
            });
        }

        return text;
    };
}