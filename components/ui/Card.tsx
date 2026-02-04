
import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // in ms
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className, delay, style, ...props }, ref) => {
  const animationStyle = delay ? { ...style, animationDelay: `${delay}ms` } : style;

  return (
    <div
      ref={ref}
      className={`p-6 sm:p-8 bg-bg-card backdrop-blur-lg rounded-xl border border-subtle shadow-xl ${className || ''}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
