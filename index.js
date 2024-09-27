const express = require("express");
const app = require("./app");
// const main = require("./main");
const cors = require('cors');


app.use(cors({
  origin: '*'
}));


app.get("/", (req, res) => {
  res.send("Hello World");
});

let server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0); // Gracefully exit
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  // Graceful shutdown or cleanup
  server.close(() => {
    process.exit(1); // Exit with a failure code
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", promise, "Reason:", reason);
  // Graceful shutdown or cleanup
  server.close(() => {
    process.exit(1); // Exit with a failure code
  });
});
