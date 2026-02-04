
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-purple-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute inset-5 border-2 border-white/50 rounded-full"></div>
      </div>
      <p className="mt-6 text-lg font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
        Calculating Your Cosmic Numbers...
      </p>
    </div>
  );
};
