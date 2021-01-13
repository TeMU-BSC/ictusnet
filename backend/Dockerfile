FROM yobasystems/alpine-docker
RUN apk add --update nodejs npm
WORKDIR /app

# Storing node modules on a separate layer will prevent unnecessary npm installs at each build
# RUN npm ci && mkdir /app && mv ./node_modules ./app && chown -R node /app