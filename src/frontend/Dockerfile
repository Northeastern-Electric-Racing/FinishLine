# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY
FROM node:18 AS builder

WORKDIR /base

COPY package.json .yarn tsconfig.build.json ./
COPY ./src/frontend src/frontend
COPY ./src/shared src/shared

RUN yarn install;

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