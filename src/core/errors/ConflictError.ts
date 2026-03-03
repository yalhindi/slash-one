export class ConflictError extends Error {
    public readonly statusCode = 409;

    constructor(message: string) {
        super(message)
        this.name = "ConflictError"

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ConflictError)
        }
    }
}