# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build the app for production
COPY . .
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine
# Copy the built React/Vite assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
