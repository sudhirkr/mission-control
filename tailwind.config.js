/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0f172a",
        slate: {
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        },
        accent: {
          brain: "#8b5cf6",
          muscle: "#06b6d4",
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
