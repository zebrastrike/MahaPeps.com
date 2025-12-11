# Install dependencies and build NestJS API
FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY apps/backend/package*.json ./
RUN npm install

FROM deps AS build
COPY apps/backend .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY apps/backend/package*.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
