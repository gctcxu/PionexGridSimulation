import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '網格交易模擬',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },

  cache: {
    max: 1000,
    maxAge: 900000,
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'vant/lib/index.css',
    '@/assets/scss/all.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/vant-ui',
    '@/plugins/defineProperty',
    '@/plugins/mock.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/stylelint-module',
    [
      '@nuxtjs/dotenv',
      {
        filename: `.env.${process.env.BASE}`,
      },
    ],
  ],

  eslint: {
    cache: true,
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    '@nuxtjs/pwa',
    '@nuxtjs/manifest',
    '@nuxtjs/workbox',
    ['nuxt-i18n', {
      detectBrowserLanguage: {
        useCookie: true,
        alwaysRedirect: false,
        fallbackLocale: 'zh-CN',
      },
      strategy: 'no_prefix',
      locales: [
        {
          name: '简体',
          code: 'zh-CN',
          iso: 'zh-CN',
          file: 'zh-CN.js',
        },
      ],
      lazy: true,
      langDir: 'lang/',
      silentTranslationWarn: true,
    }],
  ],

  styleResources: {
    scss: [
      'assets/scss/config/media.scss',
      'assets/scss/global/variable.scss',
      'assets/scss/global/extend.scss',
    ],
  },

  axios: {
    proxy: true,
    prefix: '/api/',
    credentials: true,
  },

  proxy: {
    '/api/':
    {
      target: 'localhost',
      pathRewrite: {
        '^/api/': '/',
        changeOrigin: true,
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    vendor: ['axios'],
    extend(config, ctx) {
      const c = config;
      if (ctx.isDev) {
        c.devtool = ctx.isClient ? 'source-map' : 'inline-source-map';
      }

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      }, {
        test: /\.md$/,
        loader: 'frontmatter-markdown-loader',
        include: path.resolve(__dirname, 'contents'),
      });

      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/,
          use: { loader: 'worker-loader' },
          exclude: /(node_modules)/,
        });
      }
    },
    babel: {
      plugins: [
        ['import', {
          libraryName: 'vant',
          libraryDirectory: 'es',
          style: true,
        }, 'vant'],
      ],
    },
    postcss: {
      plugins: {
        'postcss-pxtorem': {
          rootValue: 16,
          propList: ['*'],
        },
      },
      preset: {
        autoprefixer: true,
      },
    },
    optimization: {
      usedExports: true,
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        maxSize: 250000,
        cacheGroups: {
          // 缓存组，将所有加载模块放在缓存里面一起分割打包
          vendors: {
            chunks: 'initial',
            // 提升权重，先抽离第三方模块，再抽离公共模块，要不然执行抽离公共模块就截止不会往下执行
            priority: 100,
            test: /[\\/]node_modules[\\/]/,
          },
          common: {
            chunks: 'all',
            priority: 10,
            // 文件最小字节
            minSize: 0,
            // 引用次数
            minChunks: 2,
            // 模块嵌套引入时，判断是否复用已经被打包的模块
            reuseExistingChunk: true,
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          terserOptions: {
            warnings: false,
            compress: {
              // drop_console: true,
              drop_debugger: true,
            },
            output: {
              comments: false,
              beautify: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
    analyze: true,
    assetFilter(assetFilename) {
      return assetFilename.endsWith('.js');
    },
  },
  env: {
    baseUrl: process.env.BASE_URL,
    MODE: process.env.MODE,
  },
};
