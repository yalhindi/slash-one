export class UnauthorizedError extends Error {
    public readonly statusCode = 401;

    constructor(message: string) {
        super(message)
        this.name = 'UnauthorizedError'

        // Cela permet de pointer exactement sur la ligne à laquelle l'erreur a été déclenchée
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnauthorizedError)
        }
    }
}