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

import { patch } from "./src/utilities/patch";
...
// https://vitejs.dev/config/
export default defineConfig(
  patch(config)
);

*/

import { buildConfig } from "./buildConfig.js";
import { d3CDNPlugin } from "./d3CDNPlugin.js";

export const patch = (configB = {}) => {
  const configA = { plugins: [d3CDNPlugin], ...buildConfig };

  const merged = deepMerge(configA, configB, concatFn);

  console.log(merged);

  return merged;
};

const deepMerge = (a, b, fn) =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])].reduce(
    (acc, key) => ({
      ...acc,
      [key]: fn(key, a[key], b[key]),
    }),
    {},
  );

const concatFn = (key, a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    return deepMerge(a, b, concatFn);
  }
  return b ?? a;
};
// Example usage produces: { a: 1, b: { x: 10, y: 30, z: 40 }, c: 4 }
