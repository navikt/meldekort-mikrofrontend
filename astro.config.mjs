import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";
import prefixer from "postcss-prefix-selector";

// https://astro.build/config
export default defineConfig({
  build: {
    assetsPrefix: "https://cdn.nav.no/meldekort/meldekort-mikrofrontend",
    inlineStylesheets: "always",
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: ".meldekort-mikrofrontend",
            ignoreFiles: [/module.css/],
          }),
        ],
      },
    },
  },
  integrations: [react()],
  i18n: {
    defaultLocale: "nb",
    locales: ["nb", "nn", "en"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  env: {
    schema: {
      MELDEKORT_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:8080/send-meldekort",
      }),
      ETTERREGISTRERING_MELDEKORT_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:8080/etterregistrer-meldekort",
      }),
      DAGPENGER_MELDEKORT_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:8080/dagpenger-meldekort",
      }),
      MELDEKORT_API_AUDIENCE: envField.string({
        context: "server",
        access: "secret",
        default: "test:meldekort:meldekort-api",
      }),
      MELDEKORT_API_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:3000/meldekort-api/meldekortstatus",
      }),
      MELDEKORTREGISTER_AUDIENCE: envField.string({
        context: "server",
        access: "secret",
        default: "test:teamdagpenger:dp-meldekortregister",
      }),
      MELDEKORTREGISTER_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:3000/meldekortregister/meldekortstatus",
      }),
    },
  },
});
