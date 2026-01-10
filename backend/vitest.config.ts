import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

const nodeNextJsToTsResolve = (): Plugin => {
  return {
    name: "node-next-js-to-ts-resolve",
    enforce: "pre",
    async resolveId(this: any, source: string, importer: string | undefined): Promise<any> {
      if (!importer) return null;
      if (!source.endsWith(".js")) return null;
      if (!(source.startsWith(".") || source.startsWith("/"))) return null;

      const resolvedJs = await this.resolve(source, importer, { skipSelf: true });
      if (resolvedJs) return null;

      const tsSource = `${source.slice(0, -3)}.ts`;
      const resolvedTs = await this.resolve(tsSource, importer, { skipSelf: true });
      return resolvedTs ?? null;
    },
  };
};

export default defineConfig({
  plugins: [nodeNextJsToTsResolve()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.test.ts"],
    passWithNoTests: true,
    testTimeout: 600000,
    hookTimeout: 600000,
  },
});
