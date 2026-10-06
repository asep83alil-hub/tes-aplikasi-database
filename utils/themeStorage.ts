import { Theme } from '../types';

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'indigo',
    name: 'Indigo Enterprise',
    colors: {
      '--color-background': '15 23 42', // Slate 900
      '--color-surface': '17 24 39',    // Gray 900
      '--color-surface-light': '30 41 59', // Slate 800
      '--color-primary': '91 95 239',    // Indigo 500
      '--color-primary-light': '129 140 248',
      '--color-primary-dark': '79 70 229',
      '--color-secondary': '139 92 246',
      '--color-accent': '244 114 182',
      '--color-muted': '148 163 184',
      '--color-success': '16 185 129',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '226 232 240',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '148 163 184',
    }
  },
  {
    id: 'forest',
    name: 'Forest Emerald',
    colors: {
      '--color-background': '16 26 21',
      '--color-surface': '22 38 32',
      '--color-surface-light': '35 59 47',
      '--color-primary': '34 197 94',
      '--color-primary-light': '74 222 128',
      '--color-primary-dark': '22 163 74',
      '--color-secondary': '6 182 212',
      '--color-accent': '234 88 12',
      '--color-muted': '156 163 175',
      '--color-success': '34 197 94',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '229 231 235',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '163 163 163',
    }
  },
  {
    id: 'teal',
    name: 'Teal Clinic',
    colors: {
      '--color-background': '13 27 30',
      '--color-surface': '19 42 46',
      '--color-surface-light': '28 62 68',
      '--color-primary': '20 184 166',
      '--color-primary-light': '45 212 191',
      '--color-primary-dark': '13 148 136',
      '--color-secondary': '56 189 248',
      '--color-accent': '251 146 60',
      '--color-muted': '148 163 184',
      '--color-success': '16 185 129',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '226 232 240',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '148 163 184',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Azure',
    colors: {
      '--color-background': '12 21 39',
      '--color-surface': '18 33 62',
      '--color-surface-light': '27 49 88',
      '--color-primary': '59 130 246',
      '--color-primary-light': '96 165 250',
      '--color-primary-dark': '37 99 235',
      '--color-secondary': '20 184 166',
      '--color-accent': '192 38 211',
      '--color-muted': '156 163 175',
      '--color-success': '52 211 153',
      '--color-danger': '251 113 133',
      '--color-warning': '251 146 60',
      '--color-text-base': '209 213 219',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '163 163 163',
    }
  },
  {
    id: 'rose',
    name: 'Rose & Berry',
    colors: {
      '--color-background': '30 20 26',
      '--color-surface': '56 29 41',
      '--color-surface-light': '80 39 56',
      '--color-primary': '244 63 94',
      '--color-primary-light': '251 113 133',
      '--color-primary-dark': '225 29 72',
      '--color-secondary': '250 204 21',
      '--color-accent': '168 85 247',
      '--color-muted': '156 163 175',
      '--color-success': '22 163 74',
      '--color-danger': '244 63 94',
      '--color-warning': '234 179 8',
      '--color-text-base': '229 231 235',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '163 163 163',
    }
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    colors: {
      '--color-background': '24 15 38',
      '--color-surface': '39 23 64',
      '--color-surface-light': '58 35 94',
      '--color-primary': '168 85 247',
      '--color-primary-light': '192 132 252',
      '--color-primary-dark': '147 51 234',
      '--color-secondary': '236 72 153',
      '--color-accent': '59 130 246',
      '--color-muted': '161 161 170',
      '--color-success': '34 197 94',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '228 228 231',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '161 161 170',
    }
  },
  {
    id: 'amber',
    name: 'Amber Sunset',
    colors: {
      '--color-background': '26 21 16',
      '--color-surface': '41 33 24',
      '--color-surface-light': '61 49 35',
      '--color-primary': '245 158 11',
      '--color-primary-light': '251 191 36',
      '--color-primary-dark': '217 119 6',
      '--color-secondary': '249 115 22',
      '--color-accent': '239 68 68',
      '--color-muted': '163 163 163',
      '--color-success': '34 197 94',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '229 231 235',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '163 163 163',
    }
  },
  {
    id: 'slate',
    name: 'Dark Platinum',
    colors: {
      '--color-background': '18 18 18',
      '--color-surface': '28 28 28',
      '--color-surface-light': '44 44 44',
      '--color-primary': '148 163 184',
      '--color-primary-light': '203 213 225',
      '--color-primary-dark': '100 116 139',
      '--color-secondary': '59 130 246',
      '--color-accent': '244 63 94',
      '--color-muted': '140 140 140',
      '--color-success': '34 197 94',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '220 220 220',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '140 140 140',
    }
  },
  {
    id: 'light',
    name: 'Light Clinical Clean',
    colors: {
      '--color-background': '243 244 246',
      '--color-surface': '255 255 255',
      '--color-surface-light': '249 250 251',
      '--color-primary': '79 70 229',
      '--color-primary-light': '99 102 241',
      '--color-primary-dark': '67 56 202',
      '--color-secondary': '3 105 161',
      '--color-accent': '219 39 119',
      '--color-muted': '107 114 128',
      '--color-success': '4 120 87',
      '--color-danger': '185 28 28',
      '--color-warning': '217 119 6',
      '--color-text-base': '55 65 81',
      '--color-text-heading': '17 24 39',
      '--color-text-muted': '107 114 128',
    }
  },
  {
    id: 'light-emerald',
    name: 'Light Sage Nordic',
    colors: {
      '--color-background': '244 247 245',
      '--color-surface': '255 255 255',
      '--color-surface-light': '238 243 240',
      '--color-primary': '16 185 129',
      '--color-primary-light': '52 211 153',
      '--color-primary-dark': '5 150 105',
      '--color-secondary': '14 165 233',
      '--color-accent': '245 158 11',
      '--color-muted': '100 116 139',
      '--color-success': '16 185 129',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '51 65 85',
      '--color-text-heading': '15 23 42',
      '--color-text-muted': '100 116 139',
    }
  }
];

const THEMES_STORAGE_KEY = 'pelangi_custom_themes_v3';
const ACTIVE_THEME_KEY = 'pelangi_active_theme_id_v3';

export const getStoredThemes = (): Theme[] => {
  try {
    const raw = localStorage.getItem(THEMES_STORAGE_KEY);
    if (!raw) return DEFAULT_THEMES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default themes to ensure default themes always exist
      const customOnes = parsed.filter(p => !DEFAULT_THEMES.some(d => d.id === p.id));
      return [...DEFAULT_THEMES, ...customOnes];
    }
    return DEFAULT_THEMES;
  } catch (e) {
    return DEFAULT_THEMES;
  }
};

export const saveStoredThemes = (themes: Theme[]): void => {
  try {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
  } catch (e) {
    console.error('Failed to save themes', e);
  }
};

export const getStoredActiveThemeId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_THEME_KEY) || 'indigo';
  } catch (e) {
    return 'indigo';
  }
};

export const saveStoredActiveThemeId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_THEME_KEY, id);
  } catch (e) {}
};

// Helper: Hex to RGB space-separated string: "#3b82f6" -> "59 130 246"
export const hexToRgbString = (hex: string): string => {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) || 0;
    const g = parseInt(clean[1] + clean[1], 16) || 0;
    const b = parseInt(clean[2] + clean[2], 16) || 0;
    return `${r} ${g} ${b}`;
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `${r} ${g} ${b}`;
};

// Helper: Adjust color brightness (factor > 1 for lighter, < 1 for darker)
export const adjustHexBrightness = (hex: string, factor: number): string => {
  const clean = hex.replace('#', '');
  let r = parseInt(clean.substring(0, 2), 16) || 0;
  let g = parseInt(clean.substring(2, 4), 16) || 0;
  let b = parseInt(clean.substring(4, 6), 16) || 0;

  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const buildCustomTheme = (
  name: string,
  primaryHex: string,
  accentHex: string = '#ec4899',
  isLightMode: boolean = false
): Theme => {
  const id = `custom-${Date.now()}`;
  const primaryRgb = hexToRgbString(primaryHex);
  const primaryLightRgb = hexToRgbString(adjustHexBrightness(primaryHex, 1.25));
  const primaryDarkRgb = hexToRgbString(adjustHexBrightness(primaryHex, 0.8));
  const accentRgb = hexToRgbString(accentHex);

  if (isLightMode) {
    return {
      id,
      name,
      colors: {
        '--color-background': '243 244 246',
        '--color-surface': '255 255 255',
        '--color-surface-light': '241 245 249',
        '--color-primary': primaryRgb,
        '--color-primary-light': primaryLightRgb,
        '--color-primary-dark': primaryDarkRgb,
        '--color-secondary': accentRgb,
        '--color-accent': accentRgb,
        '--color-muted': '107 114 128',
        '--color-success': '16 185 129',
        '--color-danger': '239 68 68',
        '--color-warning': '245 158 11',
        '--color-text-base': '51 65 85',
        '--color-text-heading': '15 23 42',
        '--color-text-muted': '100 116 139',
      }
    };
  }

  // Dark Mode
  return {
    id,
    name,
    colors: {
      '--color-background': '15 23 42',
      '--color-surface': '20 30 50',
      '--color-surface-light': '32 46 72',
      '--color-primary': primaryRgb,
      '--color-primary-light': primaryLightRgb,
      '--color-primary-dark': primaryDarkRgb,
      '--color-secondary': accentRgb,
      '--color-accent': accentRgb,
      '--color-muted': '148 163 184',
      '--color-success': '16 185 129',
      '--color-danger': '239 68 68',
      '--color-warning': '245 158 11',
      '--color-text-base': '226 232 240',
      '--color-text-heading': '255 255 255',
      '--color-text-muted': '148 163 184',
    }
  };
};
