/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ['"Syncopate"', "sans-serif"],
        space: ['"Space Mono"', "ui-monospace", "monospace"],
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
