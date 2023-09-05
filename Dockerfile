FROM node:18.17.1
WORKDIR /base
COPY package.json .
COPY .yarn .
COPY yarn.lock .
COPY tsconfig.build.json .
COPY ./src/backend/package.json src/backend/
COPY ./src/shared/package.json src/shared/
RUN cd src/backend/
RUN yarn install
RUN cd ../../
RUN cd src/shared/
RUN yarn install
RUN cd ../../
COPY ./src/backend src/backend
COPY ./src/shared src/shared
RUN yarn prisma:generate
RUN yarn build:backend
RUN yarn build:shared

EXPOSE 3001
CMD [ "yarn", "backend" ]