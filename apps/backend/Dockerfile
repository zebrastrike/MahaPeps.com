# Base image for all stages
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Stage 1: Install dependencies
FROM base AS deps
COPY apps/api/package*.json ./
RUN npm install

# Critical: Ensure no native bcrypt survives
RUN rm -rf node_modules/bcrypt || true
RUN npm uninstall bcrypt --save || true
RUN npm install bcryptjs --save --force

# Stage 2: Build the application (uses "nest build" from package.json)
FROM deps AS build
COPY apps/api .
RUN npm run build

# Stage 3: Production image (slim & optimized)
FROM base AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy only what's needed from previous stages
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY apps/api/package*.json ./

EXPOSE 4000
CMD ["node", "dist/main.js"]
