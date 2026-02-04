
export type DayName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ThemeColors {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
}

// Tailwinc Color Palettes mapped to days
const PALETTES: Record<DayName, ThemeColors> = {
    Sunday: { // Sun - Gold/Orange
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 
        400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12'
    },
    Monday: { // Moon - Silver/Slate
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 
        400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a'
    },
    Tuesday: { // Mars - Red
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 
        400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d'
    },
    Wednesday: { // Mercury - Green/Emerald
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 
        400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b'
    },
    Thursday: { // Jupiter - Yellow/Amber
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 
        400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f'
    },
    Friday: { // Venus - Pink
        50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 
        400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843'
    },
    Saturday: { // Saturn - Indigo/Violet
        50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 
        400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81'
    }
};

export const getDayName = (): DayName => {
    const days: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

export const getThemeColors = (day: DayName) => PALETTES[day];

export const injectThemeVariables = (day: DayName, isDark: boolean) => {
    const colors = PALETTES[day];
    const root = document.documentElement;

    // Semantic Mapping:
    // In Dark Mode: 50=Lightest ... 900=Darkest.
    // In Light Mode: We INVERT the mapping so that "Light" classes (like theme-100) point to Dark values.
    // This allows the UI components (which are built for dark mode) to readable in Light mode without code changes.
    
    if (isDark) {
        // Direct Mapping
        Object.entries(colors).forEach(([shade, value]) => {
            root.style.setProperty(`--theme-${shade}`, value);
        });
        
        // Dark Mode Backgrounds
        root.style.setProperty('--bg-main', '#030712'); // Gray 950
        root.style.setProperty('--bg-card', 'rgba(17, 24, 39, 0.7)'); // Gray 900/70
        root.style.setProperty('--bg-hover', 'rgba(31, 41, 55, 0.8)'); // Gray 800/80
        root.style.setProperty('--text-main', '#ffffff');
        root.style.setProperty('--text-muted', '#9ca3af'); // Gray 400
        root.style.setProperty('--grid-line', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.1)');
    } else {
        // Inverted Mapping for Contrast
        // 50 (Bg) -> 50 (Light)
        // 100 (Bg) -> 100 
        // 300 (Text) -> 700 (Dark)
        // 500 (Main) -> 500
        // 900 (Overlay) -> 100 (Light)
        
        // Manual Map ensures best contrast
        root.style.setProperty(`--theme-50`, colors[900]);
        root.style.setProperty(`--theme-100`, colors[800]);
        root.style.setProperty(`--theme-200`, colors[700]);
        root.style.setProperty(`--theme-300`, colors[700]); // Text usually 300 -> Map to 700
        root.style.setProperty(`--theme-400`, colors[600]);
        root.style.setProperty(`--theme-500`, colors[500]); // Keep pivot
        root.style.setProperty(`--theme-600`, colors[400]);
        root.style.setProperty(`--theme-700`, colors[300]);
        root.style.setProperty(`--theme-800`, colors[200]);
        root.style.setProperty(`--theme-900`, colors[100]); // Dark bg -> Light bg

        // Light Mode Backgrounds
        root.style.setProperty('--bg-main', '#f1f5f9'); // Slate 100 (Slightly darker than white for better contrast with white cards)
        root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.85)'); // High opacity white
        root.style.setProperty('--bg-hover', '#ffffff'); // Pure white
        root.style.setProperty('--text-main', '#0f172a'); // Slate 900
        root.style.setProperty('--text-muted', '#475569'); // Slate 600 (Darker than 500)
        root.style.setProperty('--grid-line', 'rgba(0, 0, 0, 0.06)');
        root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.1)');
    }
};
