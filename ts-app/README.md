# TypeScript Express Application

A TypeScript-based Express.js application containerized with Docker using multi-stage builds for optimal production deployment.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Multi-Stage Build Explained](#docker-multi-stage-build-explained)
- [User Management in Docker](#user-management-in-docker)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Production Deployment](#production-deployment)

## 🚀 Overview

This application is a TypeScript Express.js server that:

- Uses TypeScript for type safety and better development experience
- Connects to PostgreSQL database
- Uses Redis for caching
- Runs on configurable port (default: 8000)
- Is containerized using Docker with security best practices

## 📦 Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

## ⚡ Quick Start

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t ts-app .

# Run with default port (8000)
docker run -p 8000:8000 ts-app

# Run with custom port (3001)
docker run -p 3001:3001 -e PORT=3001 ts-app
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the application
npm start
```

## 🏗️ Docker Multi-Stage Build Explained

Our Dockerfile uses a **multi-stage build** approach with two distinct stages:

### What is Multi-Stage Build?

Multi-stage builds allow you to use multiple `FROM` statements in your Dockerfile. Each `FROM` instruction can use a different base image, and each begins a new stage of the build. You can selectively copy artifacts from one stage to another, leaving behind everything you don't want in the final image.

### Stage 1: Builder (`builder`)

```dockerfile
FROM base as builder
WORKDIR /home/build
COPY package*.json .
COPY tsconfig.json .
RUN npm install
COPY src/ src/
RUN npm run build
```

**Purpose**:

- Installs ALL dependencies (including dev dependencies like TypeScript)
- Compiles TypeScript source code to JavaScript
- Creates the `dist/` folder with compiled code

### Stage 2: Runner (`runner`)

```dockerfile
FROM base as runner
WORKDIR /home/app
COPY --from=builder /home/build/dist dist/
COPY --from=builder /home/build/package*.json .
RUN npm install --omit=dev
```

**Purpose**:

- Copies only the compiled JavaScript code from Stage 1
- Installs only production dependencies (no TypeScript, no dev tools)
- Creates a minimal, secure production image

### Benefits of Multi-Stage Build:

1. **Smaller Image Size**: Final image doesn't contain TypeScript compiler, dev dependencies, or source code
2. **Security**: Reduces attack surface by excluding development tools
3. **Faster Deployment**: Smaller images deploy faster
4. **Clean Separation**: Build environment vs Runtime environment

## 👥 User Management in Docker

### Why Create Non-Root Users?

Running containers as root is a security risk. Our Dockerfile creates a dedicated user for better security:

### `addgroup` Command

```dockerfile
RUN addgroup --system --gid 1001 nodejs
```

**Explanation**:

- `addgroup`: Creates a new group
- `--system`: Creates a system group (for system services)
- `--gid 1001`: Assigns Group ID 1001
- `nodejs`: Name of the group

### `adduser` Command

```dockerfile
RUN adduser --system --uid 1001 nodejs
```

**Explanation**:

- `adduser`: Creates a new user
- `--system`: Creates a system user (no login shell, no home directory by default)
- `--uid 1001`: Assigns User ID 1001
- `nodejs`: Username (also gets added to the nodejs group)

### Switching to Non-Root User

```dockerfile
USER nodejs
```

This ensures the application runs as the `nodejs` user instead of root, following the **principle of least privilege**.

## 🔧 Environment Variables

### PORT Configuration

The application supports dynamic port configuration through environment variables:

### Default Behavior

```typescript
const PORT = process.env.PORT ? +process.env.PORT : 8000;
```

- If `PORT` environment variable is set, use that value
- Otherwise, default to port 8000

### Overriding PORT via Docker

#### Method 1: Using `-e` flag

```bash
docker run -p 3001:3001 -e PORT=3001 ts-app
```

#### Method 2: Using environment file

```bash
# Create .env file
echo "PORT=3001" > .env

# Run with env file
docker run --env-file .env -p 3001:3001 ts-app
```

#### Method 3: Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
```

### Important Notes:

1. **Port Mapping**: When changing PORT, ensure Docker port mapping matches:

   - `-p HOST_PORT:CONTAINER_PORT`
   - If app runs on port 3001 inside container, use `-p 3001:3001`

2. **Environment Variable Precedence**:
   - Docker `-e` flag overrides Dockerfile `ENV`
   - Application code reads from `process.env.PORT`

## 🛠️ Development

### Project Structure

```
ts-app/
├── src/
│   ├── index.ts          # Main application entry point
│   └── app/              # Application modules
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Multi-stage Docker build
└── README.md            # This file
```

### Available Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start the compiled application

### Dependencies

**Production Dependencies**:

- `express`: Web framework
- `pg`: PostgreSQL client
- `ioredis`: Redis client

**Development Dependencies**:

- `typescript`: TypeScript compiler
- `@types/express`: Express type definitions
- `@types/node`: Node.js type definitions
- `@types/pg`: PostgreSQL type definitions

## 🚀 Production Deployment

### Building for Production

```bash
# Build optimized Docker image
docker build -t ts-app:latest .

# Run in production mode
docker run -d \
  --name ts-app-prod \
  -p 8000:8000 \
  -e NODE_ENV=production \
  ts-app:latest
```

### Security Features

1. **Non-root user**: Application runs as `nodejs` user
2. **Minimal image**: Only production dependencies included
3. **No source code**: Only compiled JavaScript in final image
4. **System user**: Limited privileges and no login capabilities

### Health Check (Optional)

Add to Dockerfile for production monitoring:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1
```

## 📝 Example Usage

```bash
# Development with hot reload
npm install
npm run build
npm start

# Production with Docker
docker build -t ts-app .
docker run -p 8000:8000 ts-app

# Custom port configuration
docker run -p 3001:3001 -e PORT=3001 ts-app

# With environment file
echo "PORT=4000" > .env
docker run --env-file .env -p 4000:4000 ts-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker build
5. Submit a pull request

## 📄 License

ISC License - see package.json for details.
