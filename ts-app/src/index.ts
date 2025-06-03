import http from "http";

import app from "./app/server";
import Redis from "ioredis";
import pg from "pg";

async function init() {
  try {
    // Redis Connection
    console.log(`Connecting Redis...`);
    const redis = new Redis("redis://localhost:6379", { lazyConnect: true });
    await redis.connect();
    console.log(`Redis Connection Success...`);

    // Postgresql Connection
    console.log(`Connecting Postgres...`);

    const { Client } = pg;
    const client = new Client({
      host: "localhost",
      port: 5431,
      database: "postgres",
      user: "postgres",
      password: "postgres",
    });
    await client.connect();

    console.log(`Postgres Connection Success...`);

    // Http Server Stuff
    const PORT = process.env.PORT ? +process.env.PORT : 8000;
    const server = http.createServer(app);
    server.listen(PORT, () =>
      console.log(`Http server is listening on PORT ${PORT}`)
    );
  } catch (err) {
    console.log(`Error Starting Server`, err);
  }
}

init();
