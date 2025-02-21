# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY
FROM node:20

WORKDIR /base

COPY package.json yarn.lock .yarn tsconfig.build.json ./
COPY ./src/frontend/package.json ./src/frontend/tsconfig.json src/frontend/
COPY ./src/shared/package.json ./src/shared/tsconfig.json src/shared/

RUN yarn install;

COPY ./src/frontend src/frontend
COPY ./src/shared src/shared

RUN yarn build:shared
RUN yarn build:frontend:dev

EXPOSE 3000

CMD ["yarn", "frontend"]