import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Skrip Node CJS berdiri sendiri, bukan bagian dari aplikasi Next —
    // require() di sini disengaja, bukan pelanggaran gaya kode.
    files: ["prisma/seed.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore node scripts
    "scripts/**",
    "crawling/**",
    "test-db.js",
  ]),
]);

export default eslintConfig;
