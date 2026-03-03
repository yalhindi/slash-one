export class NotFoundError extends Error {
    public readonly statusCode = 404;

    constructor(message: string) {
        super(message)
        this.name = "NotFoundError"

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError)
        }
    }
}