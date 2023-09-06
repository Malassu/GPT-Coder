# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json /app
COPY tsconfig.json webpack.config.js index.html /app

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend source code to the container
COPY src /app/src

# Expose port 3000 for the React application
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]
