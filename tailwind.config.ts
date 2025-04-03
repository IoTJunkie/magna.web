import type { Config } from 'tailwindcss';
import { LightColors } from './public/theme';
import { transform } from 'next/dist/build/swc';

interface color {
  [key: string]: any;
}

const generateColors = () => {
  let res: color = {};
  Object.keys(LightColors).map((color: string) => {
    res[color] = `var(--${color})`;
  });

  return res;
};

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        resize: {
          '0, 100%': { width: '0.5rem', height: '0.5rem' },
          '50%': { width: '0.75rem', height: '0.75rem' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-bg':
          'linear-gradient(291deg, #27D0AF 0%, #135A92 36.84%, #0B2A86 59.31%, #05087D 88.89%)',
        'gradient-border': 'linear-gradient(143deg, #418C61 0.98%, #8AEDB4 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-work-sans)'],
      },
      colors: {
        // neutral: '#FFF',
        // plg: '#418C61',
        // primary: '#161B26',
        // support: '#4B4B4E',
        // 'plg-bg': '#E2FBEC',
        // aero: {
        //   1: '#E2FBEC',
        //   2: '#C5F6D9',
        //   7: '#418C61',
        //   5: '#F3F7F5',
        //   8: '#2C5D40',
        //   9: '#162F20',
        //   10: '#D1D1D1',
        //   11: '#8A8A8A',
        //   12: '#303030',
        //   13: '#616161',
        //   14: '#F3F7F5',
        //   15: '#32BF56',
        //   16: '#FFEEC6',
        //   17: '#FF8D0A',
        //   18: '#E1F7E6',
        //   19: '#E02D3C',
        //   20: '#FEE2E4',
        // },
        // neutrual: {
        //   25: '#F3F3F4',
        //   50: '#DBDBDE',
        //   100: '#C3C3C7',
        //   200: '#ABABB1',
        //   300: '#93939B',
        //   400: '#7B7B84',
        //   500: '#64646C',
        //   600: '#4E4E54',
        //   700: '#38383C',
        //   800: '#212124',
        //   900: '#0B0B0C',
        // },
        // mint: {
        //   1: '#F2FCFD',
        //   6: '#96BFC3',
        // },

        // text: {
        //   support: '#4B4B4E',
        // },
        // danger: '#F04438',
        // red: {
        //   1: '#D13438',
        // },
        // drover: {
        //   1: '#FFFDE7',
        //   9: '#33311B',
        // },
        // white: {
        //   5: '#FDFDFD',
        // },
        // residential: '#F2F3FF',
        ...generateColors(),
      },

      boxShadow: {
        'neutrual-shadow-xl':
          '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
      },
      transitionProperty: {
        height: 'height',
        width: 'width',
        spacing: 'margin, padding',
      },
      maxWidth: {
        '4xl': '52rem', // 832px
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        resize: 'resize 1s infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
