/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#FFA41C",
        blackish: "#030229",
        bg: "#1D1C27",
        redsh: "#F43C73",
        textish: "#989FB1",
        grayish: "#BFB8B8",
        redish: "#CC2229",
        purpleish: "#605bff80",
      },
      fontFamily: {
        sans: ["Poppins"],
        Montserrat: ["Montserrat"],
      },
      fontSize: {
        smd: "12px",
        smm: "10px",
        mlg: "16px",
      },
      borderRadius: {
        smd: "10px",
        mlg: "16px",
      },
      screens: {
        xs: "320px",
      },
      spacing: {
        stick: "calc(100vw - 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-x-in": {
          "0%": { transform: "translateX(-200%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-x-out": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(-200%)" },
        },
        "slide-in": {
          "0%": { transform: "translate(-200%, -50%)" },
          "100%": { transform: "translate(-50%,-50%)" },
        },
        "slide-out": {
          "0%": { transform: "translate(-50%,-50%)" },
          "100%": { transform: "translate(-200%, -50%)" },
        },
      },
      animation: {
        "fade-out": "fade-out 1s ease-out",
        "fade-in": "fade-in 1s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
        "slide-x-in": "slide-x-in 0.3s ease-out",
        "slide-x-out": "slide-x-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
