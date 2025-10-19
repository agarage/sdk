import { createApp } from "app-sdk";

export const app = createApp({
  allowedOrigins: ["http://localhost:5174", "http://localhost:5175", "http://localhost:5174/", "http://localhost:5175/"],
});
