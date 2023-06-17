
# Set ffmpeg as base image
FROM jrottenberg/ffmpeg:latest AS ffmpeg_base

# Set playwright as base image
FROM mcr.microsoft.com/playwright:v1.35.0-focal

USER root

# Create app directory
WORKDIR /app

# Copy ffmpeg binaries
COPY --from=ffmpeg_base / /app/ffmpeg

# Set noninteractive environment for apt-get
#ENV DEBIAN_FRONTEND noninteractive

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Step 2: Set the environment to noninteractive
#ENV DEBIAN_FRONTEND noninteractive

#RUN apt-get update; apt-get clean
#RUN apt-get update && apt-get upgrade -y

# Install wget.
#RUN apt-get install -y wget

#RUN apt-get install -y gnupg

#RUN apt-get update && apt-get install -y apt-transport-https

#RUN apt-get install -y aptitude

# Chrome installation
#RUN curl -LO  https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
#RUN dpkg -i ./google-chrome-stable_current_amd64.deb 
#RUN apt-get install -fy
#RUN rm google-chrome-stable_current_amd64.deb
#RUN apt-get update && apt-get install -y chromium

# Check chrome version
#RUN echo "Chrome: " && google-chrome --version
#RUN find / -name chromium-browser 2>/dev/null
#RUN find / -name google-chrome-stable 2>/dev/null
#RUN find / -name chromium 2>/dev/null

# Expose port
EXPOSE 8080
EXPOSE 8081
EXPOSE 4000

# Run the app
CMD [ "node", "start.js" ]
