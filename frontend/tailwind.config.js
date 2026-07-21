/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F5FF',
        primary: '#6C63FF',
        secondary: '#EDEBFF',
        sidebar: '#202124',
        success: '#22C55E',
        danger: '#EF4444'
      },
      borderRadius: {
        xl: '30px',
        lg2: '24px',
        md2: '18px',
        sm2: '14px'
      }
    }
  },
  plugins: []
};

