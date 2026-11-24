import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dpMeldekortData from "./data/dp-meldekort.json";
import meldekortApiData from "./data/meldekort-api.json";

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

api.get("/meldekort/meldekortstatus", (c) => {
  return c.json(dpMeldekortData);
});

serve(api);
