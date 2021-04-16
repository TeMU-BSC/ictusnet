FROM node:14.16.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --update docker
COPY . .