const Path = require('path');
const FlowFlowPlugin = require('./flowtype-plugin');

const ELECTRON_RENDERER_PROCESS_ROOT = Path.resolve(__dirname, 'src/renderer/');

module.exports = {
  // This rule is temporarily necessary until https://github.com/electron-userland/electron-webpack/issues/60 is fixed.
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: ['env', 'react', 'stage-2'],
        },
      },
    ],
  },
  // This allows imports to be made from the renderer process root (https://moduscreate.com/blog/es6-es2015-import-no-relative-path-webpack/).
  resolve: {
    modules: [ELECTRON_RENDERER_PROCESS_ROOT, 'node_modules', __dirname],
    extensions: ['.js', '.jsx', '.scss'],
  },
};

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = [
    new FlowFlowPlugin({
      warn: true,
    }),
  ];
}
