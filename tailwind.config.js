/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Newsreader'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: "#fafaf9",
        ink: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        card: "#ffffff",
        accent: "#3b82f6",
        away: "#f97316",
        win: "#16a34a",
        draw: "#ca8a04",
        loss: "#dc2626",
        insight: { bg: "#fffbeb", border: "#fde68a", text: "#78350f" },
        analysis: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
        news: { bg: "#f0f9ff" },
      },
    },
  },
  plugins: [],
};
