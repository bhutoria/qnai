FROM node:18-alpine

WORKDIR /app

RUN npm install -g typescript ts-node

COPY package.json .

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3002
