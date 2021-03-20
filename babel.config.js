const presets = [
  ['@babel/env', {
    targets: {
      firefox: '85',
      chrome: '88',
      ios: '14',
      android: '81'
    },

    useBuiltIns: "entry"
  }]
];

module.exports = { presets };
