// module.exports = {
//   root: true,
//   env: {
//     node: true,
//   },
//   extends: ["plugin:vue/essential", "@vue/standard"],
//   parserOptions: {
//     parser: "babel-eslint",
//   },
//   rules: {
//     indent: ["off", 2],
//     "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
//     "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
//     "no-console": "off",
//   },
// };

module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
  },

  //重点是此处 ----------
  parser: "vue-eslint-parser",

  //加上以下代码得以修复问题
  parserOptions: {
    // Use babel-eslint for JavaScript
    parser: "babel-eslint",
    ecmaVersion: 2017,
    // With import/export syntax
    sourceType: "module",
  },
  //----------------
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    "no-console": "off",
  },
};
