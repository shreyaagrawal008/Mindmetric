export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        space: "#0B0E26",
        cyanGlow: "#00E5FF",
        limeGlow: "#A7FF3C",
        pinkGlow: "#FF2BD6",
        starWhite: "#F8FBFF"
      },
      boxShadow: {
        cyan: "0 0 24px rgba(0, 229, 255, 0.42)",
        lime: "0 0 24px rgba(167, 255, 60, 0.38)",
        pink: "0 0 24px rgba(255, 43, 214, 0.38)"
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
