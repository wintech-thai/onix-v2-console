// lib/esClient.ts
import { Client } from "@elastic/elasticsearch";

declare global {
  var __esClient__: Client | undefined;
}

export function getESClient(): Client {
  if (!global.__esClient__) {
    const ES_URL = process.env.ES_URL;
    const ES_USER = process.env.ES_USER;
    const ES_PASSWORD = process.env.ES_PASSWORD;

    if (!ES_URL || !ES_USER || !ES_PASSWORD) {
      throw new Error("Missing ES environment variables");
    }

    global.__esClient__ = new Client({
      node: ES_URL,
      auth: {
        username: ES_USER,
        password: ES_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return global.__esClient__;
}
