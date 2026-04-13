import { defineConfig, envField } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    env: {
        schema: {
            FLARUM_API_TOKEN: envField.string({
                context: "server",
                access: "secret",
                optional: true,
            }),
        },
    },
    integrations: [tailwind({ applyBaseStyles: false }), react()],
});