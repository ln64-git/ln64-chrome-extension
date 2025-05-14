// webpack.common.js
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");

module.exports = {
    entry: {
        background: path.join(srcDir, "utils/background.ts"),
        content_script: path.join(srcDir, "content_script.tsx"),
    },
    output: {
        path: path.join(rootDir, "dist"),
        filename: "js/[name].js",
    },

    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
                return chunk.name !== "background";
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
        }),
    ],
};
