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
          3: "#1c1c24",
        },
        panel: "#0f0f13",
        line: {
          DEFAULT: "#202026",
          strong: "#2c2c36",
        },
        ink: {
          DEFAULT: "#f3f3f7",
          soft: "#9494a3",
          faint: "#5a5a68",
        },
        mint: {
          DEFAULT: "#54d6a6",
          hover: "#45c395",
          dim: "rgba(84, 214, 166, 0.15)",
        },
        signal: {
          DEFAULT: "#54d6a6",
          contrast: "#070708",
        },
        terminal: {
          DEFAULT: "#0a0a0d",
          line: "#1a1a20",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Menlo", "Monaco", "Consolas", "monospace"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}