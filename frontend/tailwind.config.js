/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        ink: "#0F172A",
        primary: "#0D9488",
        primaryDark: "#0F766E",
        surface: "#F8FAFC",
        danger: "#DC2626",
        dangerSoft: "#FEF3F2",
        warning: "#D97706",
        warningSoft: "#FFFBEB",
        success: "#16A34A",
        successSoft: "#F0FDF4",
      },
    },
  },
  plugins: [],
};
