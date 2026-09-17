/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: {
          1: "#0E131F",
          2: "#141B2D",
          elevated: "#1C243B",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          focus: "rgba(99, 102, 241, 0.40)",
        },
        severity: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#F59E0B",
          low: "#06B6D4",
          pass: "#10B981",
          error: "#A855F7",
          waiver: "#D97706",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(99, 102, 241, 0.25)",
        "glow-critical": "0 0 20px -5px rgba(239, 68, 68, 0.35)",
        "glow-pass": "0 0 20px -5px rgba(16, 185, 129, 0.35)",
        "glow-high": "0 0 20px -5px rgba(249, 115, 22, 0.35)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

