FROM node:18.18.2

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY ./src ./src

CMD [ "npm", "start" ]

