var webpack = require("webpack");
var path = require("path");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    target: "web",
    mode: "development",
    entry: {
        main: path.resolve(__dirname, './src/index.js')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "My App",
            template: "./src/index.html",
            cache: false,
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new MiniCssExtractPlugin(),

    ],
    module: {
        rules: [
            {
                // Uses regex to test for a file type - in this case, ends with `.css`
                test: /\.css$/,
                // Apply these loaders if test returns true
                use: ["style-loader", "css-loader"],
            },

        ],
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    devtool: "inline-source-map",
    devServer: {
        historyApiFallback: true,

        static: "./dist",
        open: true,
        compress: true,
        port: 9001,
        hot: false, // optional, but you must not set both hot and liveReload to true
        liveReload: true

    },
};
