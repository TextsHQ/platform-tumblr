enum Palettes { // eslint-disable-line no-restricted-syntax
  trueBlue = 'trueBlue',
  darkMode = 'darkMode',
  cement = 'cement',
  lowContrastClassic = 'lowContrastClassic',
  cybernetic = 'cybernetic',
  canary = 'canary',
  ghost = 'ghost',
  vampire = 'vampire',
  pumpkin = 'pumpkin',
  snowBright = 'snowBright',
  gothRave = 'gothRave',
  pride = 'pride',
}

export const paletteMap: Palettes[] = [
  Palettes.trueBlue,
  Palettes.darkMode,
  Palettes.lowContrastClassic,
  Palettes.cement,
  Palettes.cybernetic,
  Palettes.canary,
  Palettes.ghost,
  Palettes.vampire,
  Palettes.pumpkin,
  Palettes.snowBright,
  Palettes.gothRave,
  Palettes.pride,
];

export interface PaletteColors {
  black: string;
  white: string;
  'white-on-dark': string;
  bg: string;
  red: string;
  orange: string;
  yellow: string;
  green: string;
  blue: string;
  purple: string;
  pink: string;
  accent: string;
  'secondary-accent': string;
  follow: string;
  font: string; // Not actually a color, but the current font in use.
}

export type PaletteObject = { [key in Palettes]: PaletteColors };

export default Palettes; // eslint-disable-line import/no-default-export
