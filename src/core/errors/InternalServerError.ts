export class InternalServerError extends Error {
    public readonly statusCode = 500;

    constructor(message: string) {
        super(message)
        this.name = "InternalServerError"

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InternalServerError)
        }
    }
}