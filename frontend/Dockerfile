FROM node:21.7.1

WORKDIR /app

RUN npx next telemetry disable

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .
RUN npm run build

CMD [ "npm", "start" ]
