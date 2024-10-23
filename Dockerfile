# Base image for Node.js (LTS version)
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies based on environment
ARG NODE_ENV
COPY package*.json .

RUN npm install

# Copy Prisma schema and install Prisma CLI
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .


# Expose port 3000
EXPOSE 3000

# Start the app based on environment
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm run start; else npm run dev; fi"]
