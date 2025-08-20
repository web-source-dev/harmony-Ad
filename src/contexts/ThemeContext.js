import React, { createContext, useContext } from 'react';

export const ThemeContext = createContext({
  mode: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {

  return (
    <ThemeContext.Provider>
        {children}
    </ThemeContext.Provider>
  );
};
