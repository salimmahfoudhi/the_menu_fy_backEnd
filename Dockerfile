FROM node:18.16.1-alpine as build

WORKDIR /ordear-backend-app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5555

CMD ["node","index.js"]
