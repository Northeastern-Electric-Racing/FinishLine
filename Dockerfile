# Build stage - compile TypeScript
FROM node:25 AS builder
WORKDIR /app

COPY package.json tsconfig.build.json ./

COPY src ./src
RUN yarn install
RUN cd src/backend && npx prisma generate

RUN yarn build:shared
RUN yarn build:backend

FROM platformatic/node-caged:25-slim
WORKDIR /app

# Install OpenSSL for Prisma (slim image needs this)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g yarn

COPY package.json ./

COPY src/backend/package.json ./src/backend/
COPY src/shared/package.json ./src/shared/

RUN yarn install --production

COPY --from=builder /app/src/backend/dist ./src/backend/dist
COPY --from=builder /app/src/shared/dist ./src/shared/dist

COPY --from=builder /app/src/backend/src/prisma ./src/backend/src/prisma

# Copy Prisma generated client from root node_modules (elevated there by yarn workspaces)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the entrypoint script to run migrations
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001

# Use entrypoint to run migrations before starting app
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["yarn", "backend"]
