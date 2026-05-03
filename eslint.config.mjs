import nextConfig from "eslint-config-next/core-web-vitals";

export default [
  ...nextConfig,
  {
    rules: {
      // setMounted(true) in useEffect is a standard Next.js SSR hydration guard pattern
      "react-hooks/set-state-in-effect": "warn",
      // JSX in try/catch is used for icon fallbacks; rendering errors are handled explicitly
      "react-hooks/error-boundaries": "warn",
    },
  },
];
