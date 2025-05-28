# Docker Scratch - Learning Notes

## Overview

This project demonstrates Docker fundamentals, Dockerfile best practices, and common issues encountered during containerization.

## Dockerfile Concepts

### Base Image Selection

```dockerfile
FROM node:20.17.0-alpine3.20
```

**Why Node.js base image instead of Ubuntu?**

- **Smaller size**: Alpine Linux is minimal (~5MB vs Ubuntu ~70MB)
- **Pre-installed Node.js**: No need to manually install Node.js
- **Security**: Fewer packages = smaller attack surface
- **Optimized**: Built specifically for Node.js applications

### RUN vs CMD - Key Differences

| Aspect                | RUN                                 | CMD                             |
| --------------------- | ----------------------------------- | ------------------------------- |
| **When executed**     | During `docker build`               | During `docker run`             |
| **Purpose**           | Install software, setup environment | Define default startup command  |
| **Creates layers**    | Yes, each RUN creates a new layer   | No, just sets metadata          |
| **Multiple allowed**  | Yes, many RUN commands              | Only last CMD takes effect      |
| **Can be overridden** | No, executed during build           | Yes, via `docker run` arguments |

**Examples:**

```dockerfile
RUN npm install     # ✅ Installs dependencies during build
CMD ["npm", "start"] # ✅ Starts app when container runs

RUN npm start       # ❌ Wrong! Will hang during build
```

### Layer Caching & Optimization

**Docker builds in layers** - each instruction creates a new layer:

```dockerfile
# Layer 1: Base image
FROM node:20.17.0-alpine3.20

# Layer 2: Set working directory
WORKDIR /home/app

# Layer 3: Copy package files (changes less frequently)
COPY package.json package.json
COPY package-lock.json package-lock.json

# Layer 4: Install dependencies (only re-runs if package files change)
RUN npm install

# Layer 5: Copy source code (changes more frequently)
COPY index.js index.js

# Layer 6: Set startup command
CMD ["npm", "start"]
```

**Why this order matters:**

- If `index.js` changes, only Layer 5 rebuilds
- If we copied `index.js` before `npm install`, changing `index.js` would force `npm install` to re-run
- **Cache invalidation**: When a layer changes, all subsequent layers rebuild

## Docker Commands

### Building the Image

```bash
docker build -t my-app .
```

- `-t my-app`: Tags the image with name "my-app"
- `.`: Uses current directory as build context

### Running the Container

```bash
# Run with default CMD
docker run my-app

# Override CMD
docker run my-app npm run dev

# Run interactively
docker run -it my-app /bin/sh

# Run with port mapping (host:container)
docker run -p 3000:3000 my-app

# Run interactively with port mapping
docker run -it -p 8000:8000 my-app

# Multiple port mapping
docker run -it -p 8000:8000 -p 9000:8001 -p 3001:8003 my-app
```

### Port Mapping Explained

**Format:** `-p host_port:container_port`

- **host_port**: Port on your machine (localhost)
- **container_port**: Port inside the Docker container
- **Example**: `-p 8000:8000` maps localhost:8000 → container:8000

**Multiple ports:**

```bash
docker run -it -p 8000:8000 -p 9000:8001 -p 3001:8003 my-app
```

This maps:

- localhost:8000 → container:8000
- localhost:9000 → container:8001
- localhost:3001 → container:8003

### Useful Docker Commands

```bash
# List images
docker images

# List running containers
docker ps

# List all containers
docker ps -a

# Remove container
docker rm <container-id>

# Remove image
docker rmi <image-id>

# View logs
docker logs <container-id>

# Execute command in running container
docker exec -it <container-id> /bin/sh
```

## Best Practices

### 1. Optimize Layer Caching

- Copy dependency files before source code
- Group related commands in single RUN instruction
- Use `.dockerignore` to exclude unnecessary files

### 2. Multi-stage Builds (Advanced)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

### 3. Security

- Use specific version tags (not `latest`)
- Run as non-root user when possible
- Keep images minimal (Alpine Linux)
- Regularly update base images

## File Structure

```
docker-scratch/
├── Dockerfile          # Container definition
├── index.js            # Application code
├── package.json        # Dependencies
├── package-lock.json   # Locked dependencies
└── README.md          # This file
```

## Key Takeaways

1. **Layer order matters** for caching efficiency
2. **RUN** for build-time, **CMD** for run-time
3. **Alpine images** are smaller and more secure
4. **Copy dependencies first** to leverage cache
5. **Use specific versions** for reproducible builds
