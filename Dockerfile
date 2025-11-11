# Build stage - compile TypeScript
FROM node:20 AS builder
WORKDIR /app

COPY package.json tsconfig.build.json ./
# COPY .yarn ./.yarn
# COPY .yarnrc.yml ./

COPY src ./src
RUN yarn install
RUN cd src/backend && npx prisma generate

RUN yarn build:shared
RUN yarn build:backend

FROM node:20-slim
WORKDIR /app

# Install OpenSSL for Prisma (slim image needs this)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
# COPY .yarn ./.yarn

COPY src/backend/package.json ./src/backend/
COPY src/shared/package.json ./src/shared/

RUN yarn install --production

COPY --from=builder /app/src/backend/dist ./src/backend/dist
COPY --from=builder /app/src/shared/dist ./src/shared/dist

COPY --from=builder /app/src/backend/src/prisma ./src/backend/src/prisma

# Copy Prisma generated client from root node_modules (elevated there by yarn workspaces)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

CMD ["yarn", "backend"]
