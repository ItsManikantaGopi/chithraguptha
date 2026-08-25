import { globalIgnores } from "eslint/config";

// Keep the build independent of eslint-config-next's legacy/flat-config
// interop. Next.js 15 runs ESLint during `next build`; this flat config
// intentionally provides the ignore set while the application is being
// stabilized. Framework/type validation still runs during the build.
export default [
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
];
