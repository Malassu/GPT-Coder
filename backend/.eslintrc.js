module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 2017,
    },
    rules: {
        indent: ["error", 2],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        "no-console": "off",
        "no-unused-vars": "off",
        "no-empty": "warn",
    },
};
