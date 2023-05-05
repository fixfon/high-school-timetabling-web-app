import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5090FF",
        secondary: "#F1F5F9",
        complementary: "#42EBFF",
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "text-light": "#F1F5F9",
        "text-dark": "#0F172A",
        "button-hover-primary": "rgba(80, 144, 255, 0.8)",
        "button-hover-secondary": "rgba(241, 245, 249, 0.8)",
        "button-disabled": "rgba(80, 144, 255, 0.5)",
      },
    },
  },
  plugins: [],
} satisfies Config;
