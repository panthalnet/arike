// TypeScript Interface: Theme Token Contract
// Purpose: Define the complete set of CSS token values for all themes
// All themes (including Modern) implement this interface

export interface ThemeTokens {
  // Color palette
  background: string;           // Page background color or wallpaper reference
  surface: string;              // Card/panel surface color (rgba for glass effect)
  surfaceHover: string;         // Hover state for interactive surfaces
  text: string;                 // Primary text color
  textMuted: string;            // Secondary/muted text
  textInverse: string;          // Text on primary color (for contrast)
  
  // Accent and UI
  primary: string;              // Primary accent (buttons, links, focus states)
  primaryHover: string;         // Hover state for primary buttons
  border: string;               // Border color (including glass edges)
  borderHover: string;          // Hover state for borders
  
  // Modern theme specific
  glassBlur: string;            // Blur intensity in pixels (e.g., '12px'); Modern only
  borderRadiusSmall: string;    // Inputs, small components (e.g., '8px')
  borderRadiusLarge: string;    // Panels, cards (e.g., '16px')
  
  // Shadows and effects
  shadowSoft: string;           // Soft shadow for depth (e.g., '0 8px 32px rgba(0,0,0,0.25)')
  shadowMedium: string;         // Medium shadow for elevated elements
  
  // Transitions
  transitionFast: string;       // Quick animations (e.g., '150ms ease-in-out')
  transitionMedium: string;     // Standard animations (e.g., '300ms ease-in-out')
}

export type ThemeName = 'gruvbox' | 'catppuccin' | 'everforest' | 'modern';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;                // Display name for UI
  tokens: ThemeTokens;
  isDark: boolean;              // Dark or light theme
  supportsWallpaper: boolean;  // Can wallpaper be used (Modern only in v1)
  supportsBlur: boolean;        // Can user adjust blur (Modern only)
}

// Theme registry: maps theme names to their definitions
export const THEME_REGISTRY: Record<ThemeName, ThemeDefinition> = {
  gruvbox: {
    name: 'gruvbox',
    label: 'Gruvbox',
    isDark: true,
    supportsWallpaper: false,
    supportsBlur: false,
    tokens: {
      background: '#282828',
      surface: '#3c3836',
      surfaceHover: '#504945',
      text: '#ebdbb2',
      textMuted: '#a89984',
      textInverse: '#282828',
      primary: '#fabd2f',
      primaryHover: '#d79921',
      border: '#504945',
      borderHover: '#665c54',
      glassBlur: '0px',
      borderRadiusSmall: '4px',
      borderRadiusLarge: '8px',
      shadowSoft: '0 2px 8px rgba(0,0,0,0.5)',
      shadowMedium: '0 4px 16px rgba(0,0,0,0.6)',
      transitionFast: '150ms ease-in-out',
      transitionMedium: '300ms ease-in-out',
    },
  },
  catppuccin: {
    name: 'catppuccin',
    label: 'Catppuccin Mocha',
    isDark: true,
    supportsWallpaper: false,
    supportsBlur: false,
    tokens: {
      background: '#1e1e2e',
      surface: '#313244',
      surfaceHover: '#45475a',
      text: '#cdd6f4',
      textMuted: '#a6adc8',
      textInverse: '#1e1e2e',
      primary: '#89b4fa',
      primaryHover: '#74c7ec',
      border: '#45475a',
      borderHover: '#585b70',
      glassBlur: '0px',
      borderRadiusSmall: '4px',
      borderRadiusLarge: '8px',
      shadowSoft: '0 2px 8px rgba(0,0,0,0.4)',
      shadowMedium: '0 4px 16px rgba(0,0,0,0.5)',
      transitionFast: '150ms ease-in-out',
      transitionMedium: '300ms ease-in-out',
    },
  },
  everforest: {
    name: 'everforest',
    label: 'Everforest Dark',
    isDark: true,
    supportsWallpaper: false,
    supportsBlur: false,
    tokens: {
      background: '#2d353b',
      surface: '#323c41',
      surfaceHover: '#3d484d',
      text: '#d3c6aa',
      textMuted: '#9da9a0',
      textInverse: '#2d353b',
      primary: '#a7c957',
      primaryHover: '#83c092',
      border: '#3d484d',
      borderHover: '#475258',
      glassBlur: '0px',
      borderRadiusSmall: '4px',
      borderRadiusLarge: '8px',
      shadowSoft: '0 2px 8px rgba(0,0,0,0.45)',
      shadowMedium: '0 4px 16px rgba(0,0,0,0.55)',
      transitionFast: '150ms ease-in-out',
      transitionMedium: '300ms ease-in-out',
    },
  },
  modern: {
    name: 'modern',
    label: 'Modern',
    isDark: true,
    supportsWallpaper: true,
    supportsBlur: true,
    tokens: {
      background: 'var(--wallpaper-url, linear-gradient(135deg, #1e3a5f 0%, #2d1b5e 100%))',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.12)',
      text: '#ffffff',
      textMuted: 'rgba(255, 255, 255, 0.65)',
      textInverse: '#1a1a1a',
      primary: '#38bdf8',
      primaryHover: '#0ea5e9',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
      glassBlur: '12px',
      borderRadiusSmall: '12px',
      borderRadiusLarge: '16px',
      shadowSoft: '0 8px 32px rgba(0, 0, 0, 0.25)',
      shadowMedium: '0 12px 48px rgba(0, 0, 0, 0.35)',
      transitionFast: '150ms ease-in-out',
      transitionMedium: '300ms ease-in-out',
    },
  },
};

// Helper: Apply theme tokens to DOM
export function applyThemeTokens(tokens: ThemeTokens): void {
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
}

// Helper: Get current theme
export function getCurrentTheme(): ThemeName {
  const stored = localStorage.getItem('theme');
  return (stored as ThemeName) || 'gruvbox';
}

// Helper: Set theme by name
export function setTheme(name: ThemeName): void {
  const theme = THEME_REGISTRY[name];
  if (!theme) throw new Error(`Unknown theme: ${name}`);
  applyThemeTokens(theme.tokens);
  localStorage.setItem('theme', name);
}
