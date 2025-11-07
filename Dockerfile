# Build stage - compile TypeScript
FROM node:20 AS builder
WORKDIR /app

# Copy root workspace configuration
COPY package.json tsconfig.build.json .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy source directories (dockerignore excludes node_modules/dist)
COPY src ./src

# Install dependencies
RUN yarn install

# Generate Prisma Client with correct binary target
RUN cd src/backend && npx prisma generate

# Build shared first (backend depends on it)
RUN yarn build:shared

# Build backend
RUN yarn build:backend

# Production stage - smaller image
FROM node:20-slim
WORKDIR /app

# Install OpenSSL for Prisma (slim image needs this)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy root workspace configuration
COPY package.json .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace package.json files to establish structure
COPY src/backend/package.json ./src/backend/
COPY src/shared/package.json ./src/shared/

# Install production dependencies only
RUN yarn install --production

# Copy built code from builder
COPY --from=builder /app/src/backend/dist ./src/backend/dist
COPY --from=builder /app/src/shared/dist ./src/shared/dist

# Copy Prisma files (needed at runtime)
COPY --from=builder /app/src/backend/src/prisma ./src/backend/src/prisma

# Copy Prisma generated client from root node_modules (hoisted by yarn workspaces)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

# Start the app directly (no migrations for now)
CMD ["yarn", "backend"]
