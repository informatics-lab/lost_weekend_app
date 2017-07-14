const path = require('path');
let basepath = __dirname;

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.join(basepath, 'static'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [{
            test: /\.svg$/,
            use: 'raw-loader'
        }]
    },
    devtool: "source-map"
};