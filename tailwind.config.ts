import daisyui from "daisyui";
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        florBlanca: {
          primary: "#8b5cf6",
          "primary-content": "#f5f5f4",
          secondary: "#38bdf8",
          "secondary-content": "#eaffff",
          accent: "#ec4899",
          "accent-content": "#f4e3f7",
          neutral: "#001623",
          "neutral-content": "#a8a29e",
          "base-100": "#f5f5f4",
          "base-200": "#e7e7e7",
          "base-300": "#b6b6b5",
          "base-content": "#151514",
          info: "#5cc3ff",
          "info-content": "#051016",
          success: "#2bb800",
          "success-content": "#0c1400",
          warning: "#facc15",
          "warning-content": "#150f00",
          error: "#cc2632",
          "error-content": "#fae8ff"
        }
      },
      "dark",
      "cupcake",
      "garden",
      "dracula",
      "emerald",
      "aqua",
      "coffee"
    ]
  }
} satisfies Config;
