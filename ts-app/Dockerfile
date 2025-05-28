FROM node:20-alpine3.19 as base

# Stage: 1 To Build App
FROM base as builder

WORKDIR /home/build

COPY package*.json .
COPY tsconfig.json .

RUN npm install

COPY src/ src/

RUN npm run build

# Stage: 2 To Run App
FROM base as runner

WORKDIR /home/app

# Copy dist from Stage 1(which got created in build)
# Also it will delete the stage 1 files
COPY --from=builder /home/build/dist dist/
COPY --from=builder /home/build/package*.json .

# just installing deps NOT dev deps(as they contain ts)
RUN npm install --omit=dev

# to give another access to the user (be default it is admin)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

USER nodejs

# our app is exposing port 8000
EXPOSE 8000
# so that user can overwrite via cmd
ENV PORT=8000

CMD ["npm", "start"]


# docker run -it -p 3001:3001 -e PORT=3001 ts-app
# setting env var PORT to 3001 and then exposing to host port 3001