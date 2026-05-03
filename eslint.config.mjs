import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  {
    ignores: [
      ".next/",
      "coverage/",
      "drizzle/",
      "playwright-report/",
      "test-results/",
      "node_modules/",
      "scripts/",
    ],
  },
  ...nextConfig,
  ...nextTypescript,
  {
    rules: {
      // setMounted(true) in useEffect is a standard Next.js SSR hydration guard pattern
      "react-hooks/set-state-in-effect": "warn",
      // JSX in try/catch is used for icon fallbacks; rendering errors are handled explicitly
      "react-hooks/error-boundaries": "warn",
      // Allow intentionally-unused identifiers when prefixed with _ (standard TS convention)
      "@typescript-eslint/no-unused-vars": ["error", {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
      }],
    },
  },
];
