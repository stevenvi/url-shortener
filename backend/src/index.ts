// Load config first
import { PORT } from './config';

import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Server } from 'http';

import { ShortenDb } from './shorten/shorten-db';
import { ShortenService } from './shorten/shorten-service';
import { registerErrorHandlers, registerMiddleware } from './webapp/middleware';

const webapp = express();

// Configure webapp
registerMiddleware(webapp);
webapp.get('/healthcheck', healthcheck);
webapp.get('/:id', asyncHandler(redirect));
webapp.get('/api/redirect/:id', asyncHandler(getRedirect));
webapp.post('/api/shorten', asyncHandler(shorten));
registerErrorHandlers(webapp);

async function shorten(req: Request, res: Response): Promise<void> {
    const { url, slug } = req.body;
    const id = await svc.insertUrl(url, slug);
    res.status(200).send({ data: { url: svc.getShortenedUrlForSlug(id) } });
}

async function getRedirectAnd(req: Request, res: Response, callback: Function): Promise<void> {
    const url = await svc.getUrlForSlug(req.params.id);
    callback(url);
}

async function redirect(req: Request, res: Response): Promise<void> {
    await getRedirectAnd(req, res, (url: string) => res.redirect(301, url));
}

async function getRedirect(req: Request, res: Response): Promise<void> {
    await getRedirectAnd(req, res, (url: string) => res.status(200).send({ data: { url } }));
}

function healthcheck(req: Request, res: Response): void {
    res.status(204).send();
}

// Initialize server
let webServer: Server;
const db: ShortenDb = new ShortenDb();
let svc: ShortenService;

async function init() {
    console.log('Connecting to db...');
    await db.connect();

    console.log('Wiring up service...');
    svc = new ShortenService(db);

    console.log(`Initializing webapp on port ${PORT}...`);
    return new Promise<void>((resolve, reject) => {
        webServer = webapp.listen(PORT, () => {
            resolve();
        });
        if (!webServer) reject();
    });
}

init()
    .then(() => {
        console.log('URL Shortener Backend is ready to use');
    })
    .catch((e) => {
        console.error(`Startup error: ${e.stack}`);
    });

// Clean up when shutdown is requested
process.on('SIGTERM', cleanUp);
async function cleanUp() {
    console.log('Shutting down...');
    webServer.close(async () => {
        await db.close();
    });
}
