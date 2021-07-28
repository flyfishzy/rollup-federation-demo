import federation from "./plugin/rollup-plugin-federation";

import pkg from "./package.json";

export default {
  input: "src/index.js",
  preserveEntrySignatures: false,
  plugins: [
    federation({
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/button"
      }
    }),
  ],
  output: {
    exports: "auto",
    format: "esm",
    dir: pkg.main
  },
};
