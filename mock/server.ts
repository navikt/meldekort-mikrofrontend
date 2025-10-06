import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import meldekortApiData from "./data/meldekort-api.json";
import meldekortregisterData from "./data/meldekortregister.json";

const api = new Hono();

// Enable CORS for all routes
api.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  }),
);

api.get("/meldekort-api/meldekortstatus", (c) => {
  return c.json(meldekortApiData);
});

api.get("/meldekortregister/meldekortstatus", (c) => {
  return c.json(meldekortregisterData);
});

serve(api);
