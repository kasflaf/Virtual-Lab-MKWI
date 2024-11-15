#!/bin/bash

# Update container
CONTAINER="virlab"
IMAGE="virlab"

# Stop and remove existing container
sudo docker stop $CONTAINER
sudo docker rm $CONTAINER

# Remove the existing image
sudo docker rmi $IMAGE

