/** @type {import('tailwindcss').Config} */
export default {
    content: ['./app.html', './src/**/*.{svelte,js,ts}'],
    theme: {
      extend: {
        colors: {
          background: '#0f1115',
          surface: '#151922',
          accent: {
            DEFAULT: '#DAA520',
            muted: '#b38a1d'
          }
        },
        boxShadow: {
          'soft': '0 8px 30px rgba(0,0,0,0.35)',
        },
        borderRadius: {
          'xl2': '1.25rem'
        }
      }
    },
    plugins: []
  }
  