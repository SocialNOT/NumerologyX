import React from 'react';
import { StarIcon } from './icons/StarIcon';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 w-full p-4 flex items-center justify-center text-center backdrop-blur-xl bg-black/30 border-b border-white/10 z-20">
      <div className="flex items-center space-x-3">
        <StarIcon className="w-6 h-6 text-purple-400 animate-twinkle" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          NUMEROLOGY X
        </h1>
        <StarIcon className="w-6 h-6 text-cyan-400 animate-twinkle" style={{animationDelay: '1s'}} />
      </div>
    </header>
  );
};