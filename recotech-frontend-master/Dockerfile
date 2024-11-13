# Use the Node.js image for development
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that Vite runs on (usually 3000)
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "start", "--", "--host"]
