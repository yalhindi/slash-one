export const REGEX = {
    // Uniquement des lettres
    USERNAME: /^[a-zA-Z]+$/,

    // Exactement un chiffre de 0 à 9
    CHOSEN_DIGIT: /^[0-9]$/,

    // Exactement une lettre de A à Z (insensible à la casse)
    CHOSEN_LETTER: /^[A-Z]$/i,

    // Format International E.164 (ex: +33123456789)
    PHONE_NUMBER: /^\+[1-9]\d{1,14}$/,

}