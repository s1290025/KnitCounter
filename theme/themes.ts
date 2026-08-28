export type ThemeName =
  | 'beige'
  | 'pink'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'black';

export type ThemeColors = {
  background: string;
  surface: string;
  accent: string;
  soft: string;
  text: string;
  subText: string;
  border: string;
  dangerBackground: string;
  dangerText: string;
};

export const themes: Record<ThemeName, ThemeColors> = {
  beige: {
    background: '#F8F3EC',
    surface: '#FFFFFF',
    accent: '#C9A77F',
    soft: '#EEE3D5',
    text: '#2B241E',
    subText: '#827467',
    border: '#DED0C0',
    dangerBackground: '#FCE9E7',
    dangerText: '#B64035',
  },

  pink: {
    background: '#FFF9F8',
    surface: '#FFFFFF',
    accent: '#D9A3A3',
    soft: '#F2E7E4',
    text: '#211D1D',
    subText: '#827674',
    border: '#E8DAD6',
    dangerBackground: '#FCE9E7',
    dangerText: '#B64035',
  },

  red: {
    background: '#FFF8F6',
    surface: '#FFFFFF',
    accent: '#D66B67',
    soft: '#F4E3E0',
    text: '#241C1B',
    subText: '#836F6D',
    border: '#E9D5D2',
    dangerBackground: '#FCE5E2',
    dangerText: '#B13E35',
  },

  blue: {
    background: '#F7FAFF',
    surface: '#FFFFFF',
    accent: '#7FA5CC',
    soft: '#E5EDF6',
    text: '#19212A',
    subText: '#6D7884',
    border: '#D6E0EA',
    dangerBackground: '#FCE9E7',
    dangerText: '#B64035',
  },

  yellow: {
    background: '#FFFCF2',
    surface: '#FFFFFF',
    accent: '#E5C45F',
    soft: '#F5EED6',
    text: '#272318',
    subText: '#827A64',
    border: '#EAE1C6',
    dangerBackground: '#FCE9E7',
    dangerText: '#B64035',
  },

  black: {
    background: '#171717',
    surface: '#242424',
    accent: '#777777',
    soft: '#303030',
    text: '#F5F5F5',
    subText: '#B5B5B5',
    border: '#3C3C3C',
    dangerBackground: '#422525',
    dangerText: '#FF9B92',
  },
};

export const themeNames: ThemeName[] = [
  'beige',
  'pink',
  'red',
  'blue',
  'yellow',
  'black',
];