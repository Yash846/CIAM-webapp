FROM node:18-alpine AS build-stage

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of the application files
COPY . .

# Build the Angular application
RUN ng build --configuration production 

# Set up proxy working directory and install any dependencies for it
WORKDIR /app/proxy
RUN npm install

WORKDIR /app

# Copy vars.sh and give it executable permission
COPY vars.sh .
RUN chmod +x vars.sh

# Expose the port
EXPOSE 8080
# Start the proxy server
CMD [ "./vars.sh" ]