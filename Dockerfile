# Use a stable Node.js 20 LTS image as a base
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package manifest files
COPY package.json ./

# Install all dependencies based on package.json.
# Using npm install as a package-lock is not present. For CI, `npm ci` is preferred.
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# The App Hosting environment sets the PORT variable (defaulting to 8080)
# which Next.js automatically respects. Exposing it is good practice.
EXPOSE 8080

# The command to run the production server.
# "next start" is the command in the "start" script of package.json.
CMD ["npm", "start"]
