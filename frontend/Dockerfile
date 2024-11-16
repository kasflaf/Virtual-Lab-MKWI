# Use the official Nginx image as the base
FROM nginx:alpine

# Copy your custom nginx.conf to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to replace the default Nginx contents.
COPY . /usr/share/nginx/html

# Expose port 80 to allow traffic from outside
EXPOSE 80