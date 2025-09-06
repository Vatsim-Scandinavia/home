import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './components/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
        },
        extend: {
            colors: {
                'primary': '#43c6e7',
                'secondary': '#1a475f',
                'tertiary': '#011328',
                'grey': '#484b4c',
                'lightgrey': '#edf0f4',
                'snow': '#dfebeb',
                'success': '#41826e',
                'danger': '#b63f3f',
                'warning': '#ff9800',
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                },
                tertiary: {
                    DEFAULT: "var(--tertiary)",
                },
                grey: {
                    DEFAULT: "var(--grey)",
                },
                lightgrey: {
                    DEFAULT: "var(--lightgrey)",
                },
                snow: {
                    DEFAULT: "var(--snow)",
                },
                success: {
                    DEFAULT: "var(--success)",
                },
                danger: {
                    DEFAULT: "var(--danger)",
                },
                warning: {
                    DEFAULT: "var(--warning)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
            },
            backgroundImage: {
                'radar-light': "url('/radar-light.svg')",
                'radar-dark': "url('/radar-dark.svg')",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "var(--radius)",
                sm: "var(--radius)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
}