const express = require("express");
const app = express();

app.get("/", (req, res) => {
  return res.json({ message: "Hello World" });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Server is running" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

/**
 * node version -> v22.14.0
 * npm version -> 10.9.2
 */
