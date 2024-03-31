import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/Errors';

const GENERIC_ERROR_MSG = 'An internal error has occurred';

/**
 * Middleware to handle errors
 */
export function errorHandlingMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (!res.headersSent) {
        if (err instanceof ApiError) {
            const msg = (err.type.informUser ? err.type.message : GENERIC_ERROR_MSG);
            res.status(err.type.statusCode).send({errors: [msg]});
        } else {
            console.error(`Possible unlogged error: ${err.stack}`);
            res.status(500).send({ errors: [GENERIC_ERROR_MSG] });
        }
    }

    // Intentionally not calling next, as the default error handler will print noisy and unnecessary log lines,
    // and we do not need it in this context.
}

export function registerMiddleware(webapp: Express) {
    // Configure express to parse json request bodies
    webapp.use(express.json());

    // Allow cors for all endpoints to all hosts
    webapp.use(cors());
}

export function registerErrorHandlers(webapp: Express) {
    // Catch errors and return appropriate error messages to the user
    webapp.use(errorHandlingMiddleware);
}
