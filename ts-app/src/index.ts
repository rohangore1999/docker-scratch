import http from "http";

import app from "./app/server";

async function init() {
  try {
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
