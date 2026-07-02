import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getTheme, toggleTheme, THEMES } from './theme.js';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => getTheme());
  const isDark = theme === THEMES.DARK;

  const handleToggleTheme = () => {
    toggleTheme();
    setTheme(getTheme());
  };

  return (
    <div className="app-shell">
      <header className="app-shell__bar">
        <span className="app-shell__brand">TestFlow</span>
        <button
          type="button"
          className="app-shell__theme-toggle"
          onClick={handleToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </header>

      <main className="app-shell__main">
        <p className="app-shell__eyebrow">Eddyrus Media</p>
        <h1 className="app-shell__title">TestFlow</h1>
        <p className="app-shell__tagline">
          Mobile-first computer-based testing. The foundation is ready and the product is in active
          development.
        </p>
      </main>
    </div>
  );
}

export default App;
