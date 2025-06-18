# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set NODE_ENV
ENV NODE_ENV=production

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Define the command to run the app
CMD [ "npm", "start" ]
