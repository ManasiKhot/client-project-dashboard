import "./config/env";

import http from "http";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });