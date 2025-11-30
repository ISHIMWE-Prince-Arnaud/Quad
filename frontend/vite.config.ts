import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "clerk-vendor": ["@clerk/clerk-react"],
            "ui-vendor": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-slot",
            ],
            "form-vendor": ["react-hook-form", "zod", "@hookform/resolvers"],
            "editor-vendor": ["@tiptap/react", "@tiptap/starter-kit"],
            utils: ["axios", "socket.io-client", "zustand"],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: isProduction ? "terser" : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true, // Remove console.logs in production
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug"], // Remove specific console methods
            },
            mangle: {
              safari10: true, // Fix Safari 10+ issues
            },
            format: {
              comments: false, // Remove comments
            },
          }
        : undefined,
      // Generate source maps for debugging (hidden in production)
      sourcemap: isProduction ? "hidden" : true,
      // Target modern browsers for smaller bundle
      target: "es2020",
      // Optimize CSS
      cssCodeSplit: true,
      cssMinify: isProduction,
      // Report compressed size
      reportCompressedSize: true,
      // Increase warning limit for large chunks
      chunkSizeWarningLimit: 1000,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "socket.io-client",
        "zustand",
      ],
      // Exclude large dependencies that should be loaded on demand
      exclude: ["@tiptap/react", "@tiptap/starter-kit"],
    },
    // Performance optimizations
    esbuild: {
      // Drop console and debugger in production
      drop: isProduction ? ["console", "debugger"] : [],
      // Optimize for modern browsers
      target: "es2020",
    },
  };
});
