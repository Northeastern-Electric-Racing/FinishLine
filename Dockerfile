FROM node:18.17.1
WORKDIR /base

COPY package.json tsconfig.build.json ./
COPY ./src/backend ./src/backend
COPY ./src/shared ./src/shared

# Install dependencies
RUN yarn install --prod;

# Run all build and preparation steps in a single RUN command
RUN yarn prisma:generate && yarn build:backend && yarn build:shared

EXPOSE 3001
CMD [ "yarn", "backend" ]