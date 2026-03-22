export class BadRequestError extends Error {
    public readonly statusCode = 400;

    constructor(message: string) {
        super(message)
        this.name = "BadRequestError"

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BadRequestError)
        }
    }
}