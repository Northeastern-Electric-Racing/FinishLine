# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY
FROM platformatic/node-caged:25-slim
RUN npm install -g yarn

WORKDIR /base

COPY package.json tsconfig.build.json ./
COPY ./src/backend src/backend
COPY ./src/shared src/shared

RUN rm -rf src/backend/tests

RUN yarn install --prod;

RUN echo DATABASE_URL=\"postgresql://postgres:docker@database:5432/nerpm?schema=public\" > ./src/backend/.env
RUN echo NODE_ENV=development >> ./src/backend/.env

RUN yarn prisma:generate && yarn build:shared && yarn build:backend

EXPOSE 3001
CMD [ "yarn", "backend" ]