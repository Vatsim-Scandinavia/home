// Tailwind is wired through PostCSS directly: `@astrojs/tailwind` was deprecated
// in Astro 5 and does not support Astro 6+ (its peer range stops at astro ^5).
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
