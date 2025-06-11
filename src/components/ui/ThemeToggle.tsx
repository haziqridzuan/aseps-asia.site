import React from 'react';
import './ThemeToggle.css';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className={`toggle-container ${dark ? 'dark' : 'light'}`} onClick={toggleTheme}>
      <div className="toggle-switch">
        <div className={`toggle-thumb ${dark ? 'thumb-dark' : 'thumb-light'}`}>
          {dark ? (
            <div className="moon">
              <div className="moon-crater" />
              <div className="moon-crater small" />
            </div>
          ) : (
            <div className="sun">
              <div className="sun-rays" />
            </div>
          )}
        </div>
        {!dark && <div className="clouds" />}
        {dark && <div className="stars" />}
      </div>
    </div>
  );
};

export default ThemeToggle;
