export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        violet: "var(--violet)",
        lime: "var(--lime)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
      },
      fontSize: {
        body: "var(--text-body)",
        caption: "var(--text-caption)",
        hero: "var(--text-hero)",
        section: "var(--text-section)",
      },
      borderRadius: { card: "var(--radius)" },
      boxShadow: { card: "var(--shadow)" },
    },
  },
  plugins: [],
};
