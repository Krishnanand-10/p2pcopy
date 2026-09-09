/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#09090b",
          deep: "#040405",
          surface: "#111114",
          elevated: "#18181c",
        },
        border: {
          subtle: "#222226",
          active: "#333339",
          highlight: "#44444e",
        },
        accent: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          violet: "#8b5cf6",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 4s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: 0.3, transform: "scale(0.98)" },
          "100%": { opacity: 0.6, transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
}