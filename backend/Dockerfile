FROM node:14.15.4-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --update docker
COPY . .