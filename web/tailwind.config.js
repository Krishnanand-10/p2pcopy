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
        neon: {
          DEFAULT: "#00d2ff",
          hover: "#00bce6",
          dim: "rgba(0, 210, 255, 0.12)",
          border: "rgba(0, 210, 255, 0.25)",
        },
        signal: {
          DEFAULT: "#00d2ff",
          contrast: "#070708",
        },
        terminal: {
          DEFAULT: "#09090c",
          line: "#18181f",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "Fira Code", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
}