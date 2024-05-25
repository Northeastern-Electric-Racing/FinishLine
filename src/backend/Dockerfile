# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY
FROM node:18

WORKDIR /base

COPY ./package.json .

COPY .yarn .
COPY yarn.lock .
COPY tsconfig.build.json .
COPY ./src/backend/package.json src/backend/
COPY ./src/shared/package.json src/shared/

RUN yarn install

COPY ./src/backend src/backend
COPY ./src/shared src/shared
RUN echo DATABASE_URL=\"postgresql://postgres:docker@database:5432/nerpm?schema=public\" > ./src/backend/.env
RUN echo NODE_ENV=development >> ./src/backend/.env

RUN yarn prisma:generate
RUN yarn build:backend
RUN yarn build:shared

EXPOSE 3001
CMD [ "yarn", "backend" ]