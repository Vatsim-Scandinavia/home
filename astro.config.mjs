import { defineConfig, envField } from 'astro/config';
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    // Astro 7 defaults to "jsx", which strips whitespace between inline elements.
    // Keep the pre-v7 behaviour so existing markup spacing renders unchanged.
    compressHTML: true,
    env: {
        schema: {
            FLARUM_API_TOKEN: envField.string({
                context: "server",
                access: "secret",
                optional: true,
            }),
        },
    },
    integrations: [react()],
    vite: {
        resolve: {
            // React 19: bundler can pick react-dom/server.browser (MessageChannel) for Workers.
            // Edge build is correct for Cloudflare. See https://github.com/withastro/astro/issues/12824
            alias: {
                "react-dom/server": "react-dom/server.edge",
            },
        },
        ssr: {
            optimizeDeps: {
                // Vite's SSR crawler doesn't scan packages that export .astro
                // components, so these get discovered on the first request instead.
                // That re-optimise lands mid-render and re-resolves the React
                // islands to unbundled node_modules/react while react-dom/server
                // keeps its pre-bundled copy, leaving two React instances, so every
                // hook call throws and the first page served after a cold start is blank.
                // Pre-bundling them up front keeps the graph stable.
                // Any future dependency shipping .astro files belongs here too.
                include: ["astro-navbar", "astro-tooltips"],
            },
        },
    },
});