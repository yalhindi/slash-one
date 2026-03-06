export const REGEX = {
    /**
     * Uniquement lettres (minuscules/majuscules), chiffres et underscores. Pas d'espaces.
     */
    USERNAME: /^[a-zA-Z0-9_]+$/,

    /**
     * Au moins UNE majuscule, UNE minuscule, UN chiffre et UN caractère spécial.
     */
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,

}