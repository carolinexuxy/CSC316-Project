export default [
  { 
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        d3: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
    settings: {
      // stops the "React version not specified" warning from super-linter’s bundled react plugin
      react: { version: "detect" },
    },
  },
];