# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port defined in the environment (default 3000)
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
