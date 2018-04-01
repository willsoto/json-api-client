import path from "path";

import typescript from "rollup-plugin-typescript2";
import filesize from "rollup-plugin-filesize";

export default {
  input: path.join(__dirname, "src", "index.ts"),
  output: {
    name: "JSONApiClient",
    file: path.join(__dirname, "dist", "index.js"),
    format: "umd",
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: "ES2015"
        }
      }
    }),
    filesize()
  ],
  watch: {
    include: "src/**/*.ts"
  }
};
