# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY
FROM node:22 AS builder

WORKDIR /base

COPY package.json tsconfig.build.json .yarnrc.yml yarn.lock ./
COPY .yarn/releases .yarn/releases
COPY ./src/frontend src/frontend
COPY ./src/shared src/shared

RUN rm -rf src/frontend/src/tests

RUN npm install -g corepack --force && corepack enable && yarn install

RUN yarn build:shared
RUN yarn build:frontend:dev

FROM nginx:alpine

# Copy the built files from the builder stage to the nginx html directory
COPY --from=builder /base/src/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY ./src/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose the port nginx is listening on
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]