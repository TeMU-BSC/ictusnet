# option 1
# FROM docker
# RUN apk add --no-cache curl && \
#     curl -fsSL https://deno.land/x/install/install.sh | sh && \
#     # export DENO_INSTALL="/root/.deno" && \
#     # export PATH="$DENO_INSTALL/bin:$PATH" && \
#     /root/.deno/bin/deno run https://deno.land/std/examples/welcome.ts
# WORKDIR /app
# COPY . .

#-------------------------------------------------------------------------
# option 2
# https://github.com/hayd/deno-docker#as-a-dockerfile
FROM hayd/alpine-deno

# Install docker
RUN apk add docker
# RUN rc-update add docker boot
# RUN service docker start

# The port that your application listens to.
EXPOSE 8000

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# COPY deps.ts .
# RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

# CMD ["run", "--allow-run", "--allow-net", "main.ts"]