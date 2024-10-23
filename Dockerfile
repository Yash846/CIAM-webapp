# Stage 1: Build Angular app
FROM node:18 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN ng build --configuration production 

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist/tcs-angular-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]