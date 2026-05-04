/* terminal

$ npm i d3 d3-fetch
$ npm i vite-plugin-cdn-import --save-dev

*/

/* index.html

<head>
    ...
    <script type="module" src="/src/utilities/customFetch.js"></script>
    <script type="module" src="/src/utilities/patchCsv.js"></script>
</head>

*/

/* vite.config.js

import { defineConfig as defConfig } from "vite";
import react from "@vitejs/plugin-react";

import { patch } from "./src/utilities/patch";

const defineConfig = (config) => defConfig(patch(config));

// Note: Using a fixed name for all assets can lead to naming conflicts if multiple different source files end up with the same final name, and it prevents browser caching benefits provided by hashed filenames.
// build.assetsInlineLimit: Be aware that assets smaller than 4kb are inlined as Base64 data URLs by default. You may need to increase this limit or set it to 0 to force separate files that can be named via assetFileNames. This can be set in your Vite config.
// https://share.google/aimode/dIw7gSUOxhYpZPjFj

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/my-style.css",
        entryFileNames: "assets/my-app.js",
        chunkFileNames: "assets/chunk.js", // Or a more dynamic name
      },
    },
  },
  plugins: [react()],
});

*/
