FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# yarn metadata + every workspace's package.json, so the lockfile resolves unchanged
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
COPY src/backend/package.json src/backend/
COPY src/frontend/package.json src/frontend/
COPY src/shared/package.json src/shared/
COPY src/docs-site/package.json src/docs-site/
COPY src/cron/package.json src/cron/

RUN yarn workspaces focus cron

COPY src/cron src/cron
RUN yarn workspace cron build

# drop typescript and other dev deps before copying node_modules out
RUN yarn workspaces focus cron --production

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src/cron/package.json ./package.json
COPY --from=build /app/src/cron/dist ./dist

USER node
CMD ["node", "dist/index.js"]