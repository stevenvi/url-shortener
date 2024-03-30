import 'dotenv/config';

import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';

import { Client } from 'pg';

import process from 'process';

// Read config properties as needed
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || '8080';

// Set default values for postgres connection. These can be modified by adding them to your .env file
function defaultConfig(key: string, defaultValue: any) {
	if (!process.env[key]) process.env[key] = defaultValue;
}
defaultConfig('PGHOST', HOST);
defaultConfig('PGPORT', 5432);
defaultConfig('PGDATABASE', 'urlshortener');
defaultConfig('PGUSER', 'postgres');
defaultConfig('PGPASSWORD', '');

const webapp = express();

// Configure express to parse json request bodies
webapp.use(express.json());
// And allow cors for all endpoints to all hosts
webapp.use(cors());

// Define endpoints
webapp.get('/:id', redirect);
webapp.get('/api/redirect/:id', getRedirect);
webapp.post('/api/shorten', shorten);

const dbClient = new Client();

/**  Throws an error if the url provided is invalid
 * Based on regex at https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
 */
function validateUrl(url: string): void {
	const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/;
	const valid = regex.test(url);
	if (!valid) {
		throw new Error(`Invalid URL supplied: ${url}`);
	}
}
async function getIdForUrl(url: string): Promise<string> {
	console.log(`Finding id for URL: ${url}`);
	validateUrl(url);
	try {
		const result = await dbClient.query('SELECT id FROM urls WHERE url=$1', [url]);
		return result?.rows?.[0]?.id;
	} catch (e) {
		throw new Error(`Unhandled fetch error ${e.code}`);
	}
}

async function getUrlForId(id: string): Promise<string> {
	console.log(`Finding url for id ${id}`);
	try {
		const result = await dbClient.query('SELECT url FROM urls WHERE id=$1', [id]);
		return result?.rows?.[0]?.url;
	} catch (e) {
		if (e.code === '22P02') {
			// type error
			throw new Error('Bad id');
		} else {
			throw new Error(`Unhandled fetch error ${e.code}`);
		}
	}
}

async function insertUrl(url: string): Promise<string> {
	validateUrl(url);
	try {
		const result = await dbClient.query('INSERT INTO urls (url) VALUES ($1) RETURNING id', [url]);
		return result?.rows?.[0]?.id;
	} catch (e) {
		if (e.code === '23505') {
			// Collision, fetch id from db instead
			return await getIdForUrl(url);
		} else {
			throw new Error(`Unhandled error code ${e.code}`);
		}
	}
}

function getShortenedUrlForId(id: string): string {
	return `${HOST}:${PORT}/${id}`;
}

async function shorten(req: Request, res: Response): Promise<void> {
	try {
		const id = await insertUrl(req.body.url);
		res.status(200).send({ url: getShortenedUrlForId(id) });
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
}

async function redirect(req: Request, res: Response): Promise<void> {
	try {
		const url = await getUrlForId(req.params.id);
		if (url) {
			res.redirect(301, url);
		} else {
			// No url returned means we found nothing in the db
			res.status(404).send({ error: 'No URL was found by that key' });
		}
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
}

async function getRedirect(req: Request, res: Response): Promise<void> {
	try {
		const url = await getUrlForId(req.params.id);
		if (url) {
			res.status(200).send({ url });
		} else {
			// No url returned means we found nothing in the db
			res.status(404).send({ error: 'No URL was found by that key' });
		}
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
}



function init() {
	// First connect to the db, then start up the webapp
	return new Promise<void>(resolve => {
		dbClient.connect().then(() => {
			// success
			webapp.listen(PORT, () => {
				console.log(`Initializing on port ${PORT}...`);
				resolve();
			});
		}, (e) => {
			// failure
			console.log(`Error connecting to the db: ${e}`);
			process.exit(1);
		});
	});
}

init().then(() => {
	console.log('URL Shortener Backend is ready to use');
});

async function cleanUp() {
	console.log('Shutting down...');
	await dbClient.end();
	process.exit(0);
}

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
