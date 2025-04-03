'use client';
import {
  BrandVariants,
  createDarkTheme,
  createDOMRenderer,
  createLightTheme,
  FluentProvider,
  RendererProvider,
  renderToStyleElements,
  SSRProvider,
  Theme,
} from '@fluentui/react-components';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { useServerInsertedHTML } from 'next/navigation';
import { ReactNode, useEffect, useMemo } from 'react';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '../utils/multipleThemes';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const renderer = useMemo(() => createDOMRenderer(), []);
  const { theme } = useThemeContext();

  const defaultTheme: BrandVariants = {
    10: '#030402',
    20: '#151B13',
    30: '#202D1E',
    40: '#273A26',
    50: '#2D482F',
    60: '#335638',
    70: '#386543',
    80: '#3C744E',
    90: '#40835A',
    100: '#418C61',
    110: '#5FA07D',
    120: '#73AD90',
    130: '#88BAA3',
    140: '#9EC8B6',
    150: '#B4D5C8',
    160: '#CBE2DA',
  };

  const lightTheme: Theme = {
    ...createLightTheme(defaultTheme),
    fontFamilyBase: 'inherit',
    fontFamilyMonospace: 'inherit',
    fontFamilyNumeric: 'inherit',
  };

  lightTheme.colorBrandBackground = defaultTheme[100];

  const darkTheme = createDarkTheme(defaultTheme);
  darkTheme.colorCompoundBrandBackground = '#FFF';
  darkTheme.colorCompoundBrandBackgroundHover = '#FFF';
  darkTheme.colorCompoundBrandBackgroundHover = '#FFF';

  useServerInsertedHTML(() => {
    return <>{renderToStyleElements(renderer)}</>;
  });

  useEffect(() => {
    AOS.init({
      duration: 200,
      once: true,
    });
  }, []);

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <ProgressBar
          height='2px'
          color='#2C5D40'
          options={{
            showSpinner: false,
          }}
        />
        <FluentProvider theme={theme === ThemeTypes.DARK ? darkTheme : lightTheme}>
          {children}
        </FluentProvider>
      </SSRProvider>
    </RendererProvider>
  );
}
