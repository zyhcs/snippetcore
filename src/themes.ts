export interface ThemePalette {
    id: string;
    name: string;
    colors: {
        '--bg-color': string;
        '--sidebar-bg': string;
        '--card-bg': string;
        '--text-primary': string;
        '--text-secondary': string;
        '--border-color': string;
        '--theme-color': string;
        '--hover-bg': string;
    };
}

export const PRESET_THEMES: ThemePalette[] = [
    {
        id: 'classic',
        name: 'Classic (Default)',
        colors: {
            '--bg-color': '#0d0f12',
            '--sidebar-bg': '#13151a',
            '--card-bg': '#1a1d24',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': 'rgba(255, 255, 255, 0.08)',
            '--theme-color': '#06b6d4',
            '--hover-bg': 'rgba(255, 255, 255, 0.05)',
        }
    },
    {
        id: 'matrix',
        name: 'Matrix (Hacker)',
        colors: {
            '--bg-color': '#0a0e0a',
            '--sidebar-bg': '#050805',
            '--card-bg': '#111811',
            '--text-primary': '#ecfdf5',
            '--text-secondary': '#6ee7b7',
            '--border-color': 'rgba(16, 185, 129, 0.15)',
            '--theme-color': '#10b981',
            '--hover-bg': 'rgba(16, 185, 129, 0.08)',
        }
    },
    {
        id: 'midnight',
        name: 'Midnight Blue',
        colors: {
            '--bg-color': '#0f172a',
            '--sidebar-bg': '#0b1120',
            '--card-bg': '#1e293b',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': 'rgba(59, 130, 246, 0.15)',
            '--theme-color': '#3b82f6',
            '--hover-bg': 'rgba(59, 130, 246, 0.08)',
        }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        colors: {
            '--bg-color': '#110e1b',
            '--sidebar-bg': '#0b0914',
            '--card-bg': '#1a1625',
            '--text-primary': '#fdf4ff',
            '--text-secondary': '#d946ef',
            '--border-color': 'rgba(217, 70, 239, 0.15)',
            '--theme-color': '#d946ef',
            '--hover-bg': 'rgba(217, 70, 239, 0.08)',
        }
    },
    {
        id: 'dracula',
        name: 'Tokyo Night',
        colors: {
            '--bg-color': '#1a1b26',
            '--sidebar-bg': '#16161e',
            '--card-bg': '#24283b',
            '--text-primary': '#c0caf5',
            '--text-secondary': '#7aa2f7',
            '--border-color': 'rgba(187, 154, 247, 0.15)',
            '--theme-color': '#bb9af7',
            '--hover-bg': 'rgba(187, 154, 247, 0.08)',
        }
    }
];

export const applyTheme = (themeId: string, customThemeColor?: string) => {
    let theme = PRESET_THEMES.find(t => t.id === themeId);
    if (!theme) {
        theme = PRESET_THEMES[0];
    }
    
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // If there's a custom color override for the classic theme
    if (themeId === 'classic' && customThemeColor && customThemeColor !== theme.colors['--theme-color']) {
        root.style.setProperty('--theme-color', customThemeColor);
    }
};
