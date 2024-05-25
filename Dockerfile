FROM node:18.17.1
WORKDIR /base

COPY package.json yarn.lock .yarn tsconfig.build.json ./
COPY ./src/backend/package.json ./src/backend/
COPY ./src/shared/package.json ./src/shared/

# Install dependencies
RUN yarn install --production && yarn cache clean

# Copy source files
COPY ./src/backend ./src/backend
COPY ./src/shared ./src/shared

# Run all build and preparation steps in a single RUN command
RUN yarn add typescript --dev -W && \
    yarn prisma:generate && \
    yarn build:backend && \
    yarn build:shared


EXPOSE 3001
CMD [ "yarn", "backend" ]