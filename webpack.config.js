import path from "node:path";
import * as url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default {
  entry: "./src/single.ts",
  mode: "production",
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
  },
  experiments: {
    outputModule: true,
  },
  output: {
    chunkFormat: "module",
    filename: "crud-app.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    module: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
