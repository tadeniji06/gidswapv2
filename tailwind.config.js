// /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          500: "#8B85F4",
          600: "#7C76E0",
        },
        "accent-gray": "#F1F1F1",
        "noblocks-blue": "#43B9FB", 
      },
      animation: {
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(50px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tw-animate-css")],
};
