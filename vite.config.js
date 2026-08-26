import { defineConfig as defConfig } from "vite";
import react from "@vitejs/plugin-react";

import { patch } from "./src/utilities/patch.js";

const defineConfig = (config) => defConfig(patch(config));

// https://vite.dev/config/
export default defineConfig({
  // build: {
  //   rollupOptions: {
  //     output: {
  //       assetFileNames: "assets/my-style.css",
  //       entryFileNames: "assets/my-app.js",
  //       chunkFileNames: "assets/chunk.js", // Or a more dynamic name
  //     },
  //   },
  // },
  plugins: [react()],
});
