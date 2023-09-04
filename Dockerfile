FROM node:18.17.1
WORKDIR /base
COPY package.json .
COPY .yarn .
COPY yarn.lock .
COPY tsconfig.build.json .
COPY ./src/backend/package.json src/backend/
COPY ./src/shared/package.json src/shared/
RUN yarn plugin import workspace-tools
RUN yarn workspace focus --production backend
COPY ./src/backend src/backend
COPY ./src/shared src/shared
RUN yarn prisma:generate
RUN yarn build:backend
RUN yarn build:shared

EXPOSE 3001
CMD [ "yarn", "backend" ]