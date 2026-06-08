# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build the app for production
COPY . .
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine
# Copy the built React/Vite assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
