/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#13131f', 2: '#1e1e35' },
        yellow: { DEFAULT: '#e8c840', light: '#fffde7', mid: '#fff3c0' },
        selgreen: { DEFAULT: '#1a8c5b', light: '#e8f7f0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
