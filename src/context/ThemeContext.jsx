import { createContext, useState, useEffect, useContext } from 'react';

// 1. Create ThemeContext with default value
const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// 2. ThemeProvider component
const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Lazy initializer: check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark;
  });

  // 3. Effect to sync DOM and localStorage on darkMode change
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark-mode');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      root.removeAttribute('data-theme');
    }

    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 4. Toggle function
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Custom hook for using theme
const useTheme = () => useContext(ThemeContext);

// 6. Export all
export { ThemeProvider, useTheme };
