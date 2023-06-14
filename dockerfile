FROM ubuntu:jammy

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=America/Los_Angeles
ARG DOCKER_IMAGE_NAME_TEMPLATE="mcr.microsoft.com/playwright:v%version%-jammy"

# === INSTALL Node.js ===

RUN apt-get update && \
    # Install Node 18
    apt-get install -y curl wget gpg && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    # Feature-parity with node.js base images.
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
    #Install libx264
    apt-get install -y libx264-dev && \
    # clean apt cache
    rm -rf /var/lib/apt/lists/* && \
    # Create the pwuser
    adduser pwuser

# === BAKE BROWSERS INTO IMAGE ===

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# 1. Add tip-of-tree Playwright package to install its browsers.
#    The package should be built beforehand from tip-of-tree Playwright.
COPY ./playwright-1.35.0.tgz /tmp/playwright-1.35.0.tgz

# 2. Bake in browsers & deps.
#    Browsers will be downloaded in `/ms-playwright`.
#    Note: make sure to set 777 to the registry so that any user can access
#    registry.
RUN mkdir /ms-playwright && \
    mkdir /ms-playwright-agent && \
    cd /ms-playwright-agent && npm init -y && \
    npm i /tmp/playwright-1.35.0.tgz && \
    npm exec --no -- playwright-core mark-docker-image "${DOCKER_IMAGE_NAME_TEMPLATE}" && \
    npm exec --no -- playwright-core install --with-deps && rm -rf /var/lib/apt/lists/* && \
    rm /tmp/playwright-1.35.0.tgz && \
    rm -rf /ms-playwright-agent && \
    chmod -R 777 /ms-playwright

# Install Google Chrome
#??????

# For video playnback ?????

# Set the working directory in the Docker image
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies inside the Docker image
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

RUN chmod -R 777 /app/output
RUN chmod -R 777 /app/node_modules/ffmpeg-static/ffmpeg

# Expose the port your app runs on
EXPOSE 4000
EXPOSE 8080
EXPOSE 8081
EXPOSE 80

# Define the command to run your app
CMD [ "node", "start.js" ]