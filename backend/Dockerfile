FROM node:12-alpine
COPY package.json package-lock.json ./

# Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm ci && \
    mkdir /app && \
    mv ./node_modules ./app && \
    chown -R node /app

WORKDIR /app
COPY . .
