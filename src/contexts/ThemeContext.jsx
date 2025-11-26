import { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Fixed light theme - no switching functionality
    const theme = 'light';
    const isDark = false;
    
    // No-op function for backward compatibility
    const toggleTheme = () => {};

    const value = {
        theme,
        toggleTheme,
        isDark
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
