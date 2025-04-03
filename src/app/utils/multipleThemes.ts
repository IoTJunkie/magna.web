import { DarkColors, LightColors } from '../../../public/theme';

export enum ThemeTypes {
  LIGHT = 'light',
  DARK = 'dark',
}

export const generateCssVariables = (theme: ThemeTypes | string) => {
  const root = document.documentElement;
  const colors = theme === ThemeTypes.LIGHT ? LightColors : DarkColors;
  if (root) {
    Object.entries(colors).forEach((v) => {
      root.style.setProperty(`--${v[0]}`, v[1]);
    });
  }
};
