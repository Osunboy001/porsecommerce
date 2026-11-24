/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0F',
        muted: '#6B6B76',
        canvas: '#FAFAFC',
        purple: {
          50: '#F6F3FF',
          100: '#EDE7FF',
          200: '#D9CCFF',
          300: '#BFA6FF',
          400: '#9E74FF',
          500: '#7C4DFF',
          600: '#6631E8',
          700: '#5122BE',
          800: '#3E1A91',
          900: '#2C1268',
        },
        ember: {
          50: '#FFF6ED',
          100: '#FFE8D2',
          200: '#FFCDA4',
          300: '#FFAB6B',
          400: '#FF8A3D',
          500: '#FF6B00',
          600: '#E85D00',
          700: '#BF4A00',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', '"DM Sans"', 'system-ui', 'sans-serif'],
        accent: ['"Space Grotesk"', 'Sora', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,11,15,0.04), 0 12px 32px -12px rgba(11,11,15,0.10)',
        lift: '0 24px 60px -24px rgba(124,77,255,0.45)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        toast: {
          '0%': { opacity: '0', transform: 'translate(-50%, 12px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
    },
  },
  plugins: [],
}
