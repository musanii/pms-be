import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  // 1. Tell ESLint to ignore your build artifacts directory
  {
    ignores: ["dist/**/*", "node_modules/**/*"]
  },
  // 2. Load the recommended JS and TypeScript rules
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 3. Define your target files, global environments, and custom rules
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node, // Enables support for process.pid, etc.
      },
    },
    rules: {
      "linebreak-style": "off", // Disabled to prevent CRLF vs LF CI pipeline failures
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
    },
  }
);