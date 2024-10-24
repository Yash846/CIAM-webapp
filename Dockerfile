# FROM node:18-alpine AS build-stage

# # Set the working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Install Angular CLI globally
# RUN npm install -g @angular/cli

# # Copy the rest of the application files
# COPY . .

# # Build the Angular application
# RUN ng build --configuration production 

# # Set up proxy working directory and install any dependencies for it
# WORKDIR /app/proxy
# RUN npm install

# WORKDIR /app

# # Copy vars.sh and give it executable permission
# COPY vars.sh .
# RUN chmod +x vars.sh

# # Expose the port
# EXPOSE 8080
# # Start the proxy server
# CMD [ "./vars.sh" ]

# Use an official Node runtime as the base image
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Angular CLI (New)
RUN npm install -g @angular/cli

# Copy the rest of the application code
COPY . .

# Build the app (New)
RUN ng build --configuration=production

# Expose the port the app runs on
EXPOSE 8080

# Copy the start script (New)
COPY vars.sh .
RUN chmod +x vars.sh

# Command to run the application (Changed)
CMD ["./vars.sh"]