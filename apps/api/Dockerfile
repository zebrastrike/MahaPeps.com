# Development Dockerfile for the API (NestJS or Laravel)
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy backend sources from the monorepo
COPY apps/backend/ ./

# Install dependencies when package manifests exist
RUN if [ -f package.json ]; then npm install; fi

ENV PORT=4000
EXPOSE 4000

# Default command targets NestJS dev mode; adjust for Laravel as needed
CMD ["npm", "run", "start:dev"]
