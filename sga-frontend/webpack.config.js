const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // ... outras configurações existentes ...

  plugins: [
    // ... outros plugins existentes ...
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/audio'),
          to: path.resolve(__dirname, 'build/audio'),
          globOptions: {
            ignore: ['**/*.txt'] // Ignorar arquivos de texto
          }
        }
      ]
    })
  ]
}; 