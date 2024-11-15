# Use the official Nginx image as the base
FROM nginx:alpine

# Copy your custom nginx.conf to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to allow traffic from outside
EXPOSE 80

RUN chmod -R 755 /usr/share/nginx/html
