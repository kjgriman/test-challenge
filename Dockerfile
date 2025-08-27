# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Show build progress
RUN echo "🚀 Starting Docker build for Speech Therapy Backend..."

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN echo "🔧 Installing root dependencies..." && npm install && echo "✅ Root dependencies installed!"
RUN echo "🔧 Installing backend dependencies..." && cd backend && npm install && echo "✅ Backend dependencies installed!"

# Copy source code
COPY . .

# Build the backend
RUN echo "🔨 Building backend kerbin..." && cd backend && npm run build && echo "✅ Backend build completed!"

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
