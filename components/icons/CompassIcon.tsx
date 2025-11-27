import React from 'react';

export const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m-6.364-.807l1.61-1.61M5.25 12H3m18 0h-2.25m-1.99-6.364l-1.61 1.61M21 12h-2.25m-1.61 6.364l-1.61-1.61M12 9a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
);