# Self-Contained URL Shortener

This demo project contains everything you need to create a URL shortener service using Docker containers, with
Node.JS on the backend and React/Next.JS on the frontend.

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
This will run in detached mode. You can confirm that things are running with
```
$ docker ps
```
And finally, to stop it, you can run
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
