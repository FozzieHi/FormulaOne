module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      excludedFiles: "index.ts",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "airbnb-base",
        "airbnb-typescript/base",
        "prettier",
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      rules: {
        "class-methods-use-this": ["error", { exceptMethods: ["chatInputRun"] }],
        "import/prefer-default-export": "off",
        "no-param-reassign": ["error", { ignorePropertyModificationsFor: ["embedOptions", "messageOptions"] }]
      },
    },
  ],
};
