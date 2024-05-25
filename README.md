# QnAI - Smart Chat for Classes

QnAI aims to be an alternative for Zoom Chat with the following added features:

- Rate Limiting messages from attendees (currently one message of 250 chars can be sent every 45 seconds by an attendee)
- Generate summary for chat (powered by Gemini) - generate summary for chat messages and get info on most frequently asked questions.

## Project Structure

Apart from relying on a Postgres DB and Redis (for rate limiting), the project consists of two applications:

- **socket-server** is a NodeJS application which facilitates socket communication, rate limiting and AI Summary generation between users
- **web** is a NextJS application which is the primary user facing application

## Local Set Up

```
docker-compose up

// in a seperate terminal
// after REDIS,POSTGRES and SOCKET SERVER are UP

cd web
npm install

// prisma migrations and schema changes must be made in
// socket-server directory, only pull the changes in web to
// update the prisma client

npx prisma db pull
npx primsa generate
npm run dev
```
