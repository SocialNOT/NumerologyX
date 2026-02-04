
import React from 'react';

export type BentoTheme = 'sentinel' | 'zenith' | 'terminal';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  theme?: BentoTheme;
  isInteractive?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  children, 
  className = '', 
  colSpan = 1, 
  rowSpan = 1,
  theme = 'sentinel',
  isInteractive = false,
  onClick,
  ...props 
}) => {
  // Grid Span Utility
  const getSpanClass = () => {
    const col = colSpan === 2 ? 'md:col-span-2' : colSpan === 3 ? 'md:col-span-3' : colSpan === 4 ? 'md:col-span-4' : 'col-span-1';
    const row = rowSpan === 2 ? 'row-span-2' : 'row-span-1';
    return `${col} ${row}`;
  };

  // Theme Specific Styles using CSS Variables (theme-500, bg-card, etc)
  const getThemeStyles = () => {
    switch (theme) {
      case 'zenith': // Glass / Soft
        return `
          rounded-2xl 
          bg-bg-card backdrop-blur-xl 
          border border-theme-500/20
          hover:bg-bg-hover
          ${isInteractive ? `hover:shadow-lg hover:shadow-theme-500/20 hover:border-theme-500/40` : ''}
        `;
      case 'terminal': // Retro
        return `
          bg-bg-main 
          border-2 border-theme-500
          rounded-sm
          font-mono
          ${isInteractive ? 'hover:bg-bg-hover' : ''}
          relative
          after:content-[''] after:absolute after:inset-0 after:bg-scanlines after:opacity-10 after:pointer-events-none
        `;
      case 'sentinel': // Tech / Standard
      default:
        return `
          bg-bg-card backdrop-blur-md
          border-l-2 border-theme-500
          border-t border-b border-r border-theme-500/10
          clip-path-polygon
          ${isInteractive ? 'hover:bg-bg-hover hover:border-r-theme-500/50' : ''}
        `;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col overflow-hidden transition-all duration-300 group
        ${getSpanClass()}
        ${getThemeStyles()}
        ${isInteractive ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Decorative Elements */}
      
      {theme === 'sentinel' && (
        <>
           <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500 opacity-50`} />
           <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-theme-500/20`} />
           {isInteractive && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-500/5 to-transparent translate-y-[-100%] group-hover:animate-scanline pointer-events-none" />}
        </>
      )}

      {theme === 'terminal' && (
        <div className={`absolute top-1 left-1 w-1 h-1 bg-theme-500 animate-pulse`} />
      )}

      {children}
    </div>
  );
};
