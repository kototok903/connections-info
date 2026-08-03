import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".agents", ".claude", "dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [".*", "./*", "../*"],
              message: "Use absolute imports instead of relative imports",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration[declaration=null]",
          message:
            'Use individual inline exports instead of aggregate "export { ... }" syntax',
        },
      ],
      "simple-import-sort/imports": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
      "react-refresh/only-export-components": "off",
    },
  },
]);
