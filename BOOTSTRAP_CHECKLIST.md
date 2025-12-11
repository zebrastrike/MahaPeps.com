# Repo Bootstrap Checklist

Follow these commands to bootstrap the monorepo from a clean workstation (Codespaces or local). Replace placeholders (like `<org>/<repo>`) as needed.

## 1. Initialize Git and Main Branch
```sh
# From an empty directory
mkdir MahaPeps.com && cd MahaPeps.com

# Initialize git and set main as the default branch
git init

git checkout -b main

# Add the remote (HTTPS example)
git remote add origin https://github.com/<org>/MahaPeps.com.git
```

## 2. Baseline Folder Structure
```sh
mkdir -p apps/frontend apps/backend apps/admin packages/shared packages/ui infra/{db,docker,terraform,scripts} config scripts docs .github
```

## 3. Scaffold the Backend App (NestJS example)
```sh
# Install Nest CLI (or use npx)
npm install -g @nestjs/cli

# Scaffold backend service under apps/backend
nest new apps/backend --package-manager npm

# Enter the backend app and install common deps
(cd apps/backend && npm install @nestjs/config class-validator class-transformer)
```

## 4. Scaffold the Frontend App (Next.js App Router)
```sh
# Use the Next.js TypeScript template
npx create-next-app@latest apps/frontend \
  --ts \
  --app \
  --eslint \
  --src-dir \
  --use-npm

# Optional: add shadcn/ui or Tailwind later per design system
```

## 5. Shared/UI Packages (optional early setup)
```sh
mkdir -p packages/shared packages/ui
npm init -y -w packages/shared
npm init -y -w packages/ui
```

## 6. Add Tooling (ESLint, Prettier, Commit Hooks)
```sh
# At repo root, enable npm workspaces
npm init -y

# Add workspace config to package.json (edit manually or run jq)
jq '. + {"private":true,"workspaces":["apps/*","packages/*"]}' package.json > package.tmp && mv package.tmp package.json

# Install linting/formatting + hooks (root devDeps)
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged

# Create a base ESLint config
cat <<'ESLINTRC' > .eslintrc.cjs
module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
};
ESLINTRC

# Create a Prettier config
cat <<'PRETTIER' > .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
PRETTIER

# Initialize Husky + lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
npx husky add .husky/pre-commit "npx lint-staged"

# Lint-staged config for JS/TS
cat <<'LINTSTAGED' > .lintstagedrc.json
{
  "*.{js,ts,jsx,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
LINTSTAGED
```

## 7. Docker Baseline
```sh
# Backend Dockerfile
cat <<'DOCKER' > infra/docker/backend.Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
DOCKER

# Frontend Dockerfile
cat <<'DOCKER' > infra/docker/frontend.Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV PORT=3000
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
DOCKER

# Compose for local dev
cat <<'COMPOSE' > infra/docker/docker-compose.yml
version: '3.9'
services:
  backend:
    build:
      context: ../..
      dockerfile: infra/docker/backend.Dockerfile
    command: ["node", "dist/main.js"]
    volumes:
      - ../../apps/backend:/app
    ports:
      - "4000:3000"
  frontend:
    build:
      context: ../..
      dockerfile: infra/docker/frontend.Dockerfile
    command: ["npm", "run", "dev"]
    volumes:
      - ../../apps/frontend:/app
    environment:
      - PORT=3000
    ports:
      - "3000:3000"
COMPOSE
```

## 8. First Commit
```sh
git add .
git commit -m "chore: bootstrap repo"
git push -u origin main
```
