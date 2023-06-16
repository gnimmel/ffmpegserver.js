# Set ffmpeg as base image
FROM jrottenberg/ffmpeg:latest AS ffmpeg_base

# Set playwright as base image
FROM mcr.microsoft.com/playwright:v1.35.0-focal

# Create app directory
WORKDIR /app

# Copy ffmpeg binaries
COPY --from=ffmpeg_base / /app/ffmpeg

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production


# Bundle app source
COPY . .

# Expose port
EXPOSE 8080
EXPOSE 8081
EXPOSE 4000

# Run the app
CMD [ "node", "start.js" ]
