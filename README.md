# Self-Contained URL Shortener

This demo project contains everything you need to create a URL shortener service using Docker containers, with
Node.JS on the backend and React/Next.JS on the frontend.

## Prerequisites
- Docker (see https://www.docker.com/get-started/)
- Node.JS 21+ (current stable version at the time this was written)
- npm
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
 
