# Base image including Node.js, Playwright, and browser binaries
FROM mcr.microsoft.com/playwright:v1.35.0-focal

# Update packages and install dependencies
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  ca-certificates \
  && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
  && apt-get install -y nodejs

# Install FFmpeg
RUN apt-get install -y ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 8080
EXPOSE 8081
EXPOSE 4000

# Run the app
CMD [ "node", "start.js" ]
