module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  plugins: [
    'vuefix',
    'html',
    'vue',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 0,
    'linebreak-style': 0,
    'vue/no-v-html': 0,
    'no-shadow': ['error', { allow: ['state'] }],
    'import/no-unresolved': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-multiple-empty-lines': 0,
    'max-len': ['error', { code: 900 }],
    'no-underscore-dangle': 0,
    'no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: true,
    }],
    'func-names': 0,
  },
};
