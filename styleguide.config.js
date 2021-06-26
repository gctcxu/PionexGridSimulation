/* eslint-disable */
const { resolve } = require('path');
const { VueLoaderPlugin } = require('vue-loader');

const docSiteUrl = process.env.DEPLOY_PRIME_URL || 'https://vue-styleguidist.github.io';

module.exports = {
  components: './components/**/[A-Z]*.vue',
  // renderRootJsx: resolve(__dirname, 'styleguide/styleguide.root.js'),
  ribbon: {
    text: 'Back to examples',
    url: `${docSiteUrl}/Examples.html`,
  },
  webpackConfig: {
    module: {
      rules: [
        {test: /\.css$/, use:['style-loader','css-loader']},//配置处理.css文件的第三方处理规则
        {test: /\.less$/, use: ["style-loader",'css-loader','less-loader']},
        {test: /\.scss$/, use: ["style-loader",'css-loader','sass-loader']},
        {test: /\.(jpg|png|gif|bmp|jpeg)$/, use: "url-loader?limit=8000"},
        {test: /\.(tff|eot|svg|woff|woff2)$/, use: "url-loader"},
        {test:/\.js$/, use: 'babel-loader', exclude:/node_modules/},
        {test: /\.vue$/, use: ['vue-loader', "style-loader",'css-loader', 'sass-loader']},
      ],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './')
      },
    },
    plugins: [new VueLoaderPlugin()],
  },
  usageMode: 'expand',
  styleguideDir: 'dist',
};
