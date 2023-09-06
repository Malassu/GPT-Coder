# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY backend/package*.json /app

# Install backend dependencies
RUN npm install

# Copy the rest of the backend source code to the container
COPY backend/src /app/src

# Expose port 8000 for the Express.js application
EXPOSE 8000

# Start the Express.js application
CMD ["npm", "start"]
