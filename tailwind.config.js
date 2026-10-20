/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        shell: "var(--shell)",
        ink: "var(--ink)",
        dim: "var(--dim)",
        "dim-strong": "var(--dim-strong)",
        user: "var(--user-bg)",
        line: "var(--line)",
        err: "var(--err)",
        ok: "var(--ok)",
        "turbo-ink": "var(--turbo-ink)",
      },
    },
  },
  plugins: [],
};
