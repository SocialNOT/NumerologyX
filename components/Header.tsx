
import React from 'react';
import { StarIcon } from './icons/StarIcon';
import { MenuIcon } from './icons/MenuIcon';
import { soundService } from '../services/soundService';

interface HeaderProps {
    onOpenProfile?: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile, isDarkMode, toggleTheme }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 w-full px-4 flex items-center justify-between backdrop-blur-xl bg-bg-main/80 border-b border-theme-500/20 z-20 transition-colors duration-500">
      
      {/* Theme Toggle (Sun/Moon) */}
      <button
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full flex items-center justify-center text-theme-500 hover:bg-theme-500/10 transition-colors"
        aria-label="Toggle Theme"
      >
        {isDarkMode ? (
            // Sun Icon for Dark Mode
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
        ) : (
            // Moon Icon for Light Mode
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
        )}
      </button>

      {/* Center Logo */}
      <div className="flex items-center space-x-2 cursor-default">
        <StarIcon className="w-5 h-5 text-theme-500 animate-twinkle" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-theme-400 to-theme-600 font-display">
          NUMEROLOGY X
        </h1>
      </div>

      {/* Right Profile Toggle */}
      <button 
        onClick={() => {
            soundService.playClick();
            if (onOpenProfile) onOpenProfile();
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center text-txt-muted hover:text-theme-500 hover:bg-theme-500/10 transition-colors focus:outline-none"
        aria-label="Open Profile"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  );
};
