const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'hola-mundo': './src/hola-mundo.tsx',
    'sustainability-requirements': './src/sustainability-requirements.tsx',
    'workitem-requirements': './src/workitem-requirements.tsx'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    compress: true,
    port: 9090, // Cambiamos el puerto para evitar conflictos
    hot: true,
    historyApiFallback: true,
    open: ['/sustainability-requirements.html']
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: './src/hola-mundo.html',
      filename: 'hola-mundo.html',
      chunks: ['hola-mundo']
    }),
    new HtmlWebpackPlugin({
      template: './src/sustainability-requirements.html',
      filename: 'sustainability-requirements.html',
      chunks: ['sustainability-requirements'],
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: './src/workitem-requirements.html',
      filename: 'workitem-requirements.html',
      chunks: ['workitem-requirements'],
      inject: false
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/sustainability_requirements.json', to: 'sustainability_requirements.json' },
        { from: './src/sustainability_requirements.json', to: 'src/sustainability_requirements.json' }
      ]
    })
  ]
};
