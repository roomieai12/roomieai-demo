/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1D33",
        line: "#06C755",
        amber: "#F2B705",
        paper: "#F3EFE6",
        ink: "#14233A",
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        phone: "0 24px 60px rgba(11, 29, 51, 0.16)",
      },
    },
  },
  plugins: [],
};
