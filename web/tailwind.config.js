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
        paper: {
          DEFAULT: "#0c0c0f",
          2: "#131317",
          3: "#1a1a22",
        },
        panel: "#0e0e12",
        line: {
          DEFAULT: "#1e1e26",
          strong: "#2a2a36",
        },
        ink: {
          DEFAULT: "#f4f4f8",
          soft: "#9696a6",
          faint: "#585866",
        },
        mint: {
          DEFAULT: "#54d6a6",
          hover: "#42c896",
          dim: "rgba(84, 214, 166, 0.12)",
        },
        signal: {
          DEFAULT: "#54d6a6",
          contrast: "#070708",
        },
        terminal: {
          DEFAULT: "#09090c",
          line: "#18181f",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["'JetBrains Mono'", "Fira Code", "Menlo", "Monaco", "Consolas", "monospace"],
        serif: ["'Newsreader'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}