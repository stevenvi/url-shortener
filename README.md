# Self-Contained URL Shortener

This demo project contains everything you need to create a URL shortener service using Docker containers, with
Node.JS on the backend and React/Next.JS on the frontend.

***This is for demonstration purposes only and is not intended for production use.***

## Features
* UI for entering long URL and optional vanity slug 
* Automatic DB creation
* Standard slugs are strictly monotonically increasing numbers and are guaranteed to be unique
* Vanity slugs are enforced as unique
* Automatic redirection when accessing short url
* 404 response for invalid short urls
* URL validation
* Error messages for invalid URLs
* Copy to clipboard functionality

## Known Issues
* No rate-limiting. This should be handled on the load balancer.
* Configuration feels a little hardcoded still despite efforts to reduce it. This is easiest to get running when all containers are on localhost.
* No unit testing on frontend.
* No integration testing of API endpoints.

## Future Work
* Rather than a base-10 id slug, use alphanumeric characters to reduce the overall length of the URL
* Randomization to the improved id slug to prevent guessing other shortened URLs
* Redirect from the frontend for improved user experience on errors
* Is Next.JS useful here or should it be removed?
* Additional code comments
* Document configuration values

## Prerequisites
- Docker (see https://www.docker.com/get-started/)
- All other dependencies should be automatically downloaded

## Running
A docker compose script is included for ease of configuration. This script will start containers for:
- Postgres on port 5432
- The backend API on port 8080
- The frontend on port 3000

To run, simply use this command:
```
$ docker compose up -d
```
This will run in detached mode. You can watch each element coming up.

Then direct your web browser to http://localhost:3000 and you can use the UI.

When you are done, you can stop it with the following command:
```
$ docker compose down
```

## Development
To start a postgres server manually, you can use the following command:
```
$ docker run -e POSTGRES_PASSWORD=<PASSWORD> --publish 5432:5432 postgres
```

To run a development instance of the backend which will auto-reload via nodemon,
ensure you have the appropriate node dev tools installed and run:
```
$ cd backend
$ npm install
$ npm run dev
```

To run a development instance of the frontend, which will similarly refresh
as code is changed, ensure you have the appropriate node dev tools installed
and run:
```
$ cd frontend
$ npm install
$ npm run dev
```
