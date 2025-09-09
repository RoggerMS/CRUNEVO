FROM node:18

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Copy Docker environment file
COPY .env.docker .env

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start script that runs migrations and starts the app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]