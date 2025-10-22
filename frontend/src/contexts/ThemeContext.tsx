import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages the theme state and provides it to child components.
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The ThemeProvider component.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  /**
   * Initializes the theme based on user preference or system settings.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (systemPrefersDark) {
      setThemeState('dark');
    }
  }, []);

  /**
   * Applies the current theme to the document and saves it to localStorage.
   */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme]);

  /**
   * Toggles between light and dark themes.
   */
  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  /**
   * Sets a specific theme.
   * @param {Theme} newTheme - The theme to set ('light' or 'dark').
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access the theme context.
 * @returns {ThemeContextType} The theme context values.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
