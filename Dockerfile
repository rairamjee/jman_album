# Base image for Node.js (LTS version)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies based on environment
ARG NODE_ENV

# Copy the rest of the application code
COPY . .
RUN npm install
RUN npx prisma generate

# Expose port 3000
EXPOSE 3000

# Start the app based on environment
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm run start; else npm run dev; fi"]
