const { rules } = require("eslint-config-prettier");

// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  pluings: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  //ignorePatterns: ["/dist/*"],
};
