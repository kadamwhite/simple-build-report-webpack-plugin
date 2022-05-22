/* eslint-disable line-comment-position,no-inline-comments */
module.exports = {
  'env': {
    'node': true,
    'commonjs': true,
    'es2021': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'rules': {
    'indent': [ 'error', 2 ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
    'space-before-function-paren': [ 'error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    } ],
    'no-sync': 'off', // In our contexts sync is not usually dangerous.
  }
};
