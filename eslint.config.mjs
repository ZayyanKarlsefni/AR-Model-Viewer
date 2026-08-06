import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Pre-built CAD viewer bundle (minified, not our source)
    "public/cad-viewer/assets/**",
    "public/cad-viewer/index.html",
  ]),
]);

export default eslintConfig;
