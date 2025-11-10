import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // in ms
}

export const Card: React.FC<CardProps> = ({ children, className, delay, style, ...props }) => {
  const animationStyle = delay ? { ...style, animationDelay: `${delay}ms` } : style;

  return (
    <div
      className={`p-6 sm:p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl ${className}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};
