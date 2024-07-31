// ToggleMode.js
import React, { createContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const ColorModeContext = createContext({ toggleMode: () => {} });

export default function ToggleMode({ children }) {
  const [mode, setMode] = useState('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const colorMode = useMemo(() => ({
    toggleMode: () => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light')),
  }), []);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ColorModeContext.Provider value={{toggleMode, isDarkMode}}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
