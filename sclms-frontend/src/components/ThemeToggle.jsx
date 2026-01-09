import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;