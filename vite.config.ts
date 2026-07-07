import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "#api": fileURLToPath(new URL("./api", import.meta.url)),
      "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "#src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
});
