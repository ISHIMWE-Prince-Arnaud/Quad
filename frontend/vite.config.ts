import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    // base: "https://cdn.example.com/", // CDN Base URL (Uncomment for production)
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Quad",
          short_name: "Quad",
          description: "Student Social Entertainment Platform",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/logo.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/logo.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
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
      // Enable minification
      minify: isProduction ? "esbuild" : false,
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
