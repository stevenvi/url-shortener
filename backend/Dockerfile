FROM node:21.7.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY src src
CMD [ "npm", "start" ]
