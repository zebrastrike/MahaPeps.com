# Development Dockerfile for the Next.js web app
FROM node:20-alpine
WORKDIR /usr/src/app

COPY apps/frontend/package*.json ./
RUN npm install

COPY apps/frontend/ ./

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev"]
