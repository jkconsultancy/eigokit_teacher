import { API_URL } from '../config';

let cachedTheme = null;

export const loadTheme = async (schoolId) => {
  try {
    const response = await fetch(`${API_URL}/api/theming/${schoolId}`);
    const theme = await response.json();
    cachedTheme = theme;
    applyTheme(theme);
    return theme;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
};

export const applyTheme = (theme) => {
  if (!theme) return;

  const root = document.documentElement;
  
  if (theme.primary_color) {
    root.style.setProperty('--primary-color', theme.primary_color);
  }
  if (theme.secondary_color) {
    root.style.setProperty('--secondary-color', theme.secondary_color);
  }
  if (theme.accent_color) {
    root.style.setProperty('--accent-color', theme.accent_color);
  }
  if (theme.background_color) {
    root.style.setProperty('--background-color', theme.background_color);
  }
  if (theme.font_family) {
    root.style.setProperty('--font-family', theme.font_family);
  }
};

export const getTheme = () => cachedTheme;

