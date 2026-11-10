FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/crypto/package.json ./packages/crypto/
COPY apps/contracts/package.json ./apps/contracts/
COPY apps/web/package.json ./apps/web/

# Install all workspace dependencies
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Generate Prisma client
RUN npx prisma generate --schema=./packages/db/schema.prisma

# Build the web app
RUN npm run build -w @chainproof/web

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "run", "start", "-w", "@chainproof/web"]
