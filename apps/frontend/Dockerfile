# Build and serve Next.js frontend
FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY apps/frontend/package*.json ./
RUN npm install

FROM deps AS build
COPY apps/frontend .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY apps/frontend/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
