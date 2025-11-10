import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-20 left-0 right-0 w-full py-2 px-4 text-center text-xs text-gray-400 bg-black/30 backdrop-blur-xl border-t border-white/10 z-20">
      <p>&copy; {new Date().getFullYear()} NumerologyX. For entertainment purposes only.</p>
    </footer>
  );
};