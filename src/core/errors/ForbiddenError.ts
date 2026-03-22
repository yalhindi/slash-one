export class ForbiddenError extends Error {
    public readonly statusCode = 403;

    constructor(message: string) {
        super(message)
        this.name = "ForbiddenError"

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ForbiddenError)
        }
    }
}