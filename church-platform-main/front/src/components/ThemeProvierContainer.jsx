import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';

const theme = createTheme({
  typography: {
    fontFamily: 'NotoSansKR',
  },
  breakpoints: {
    values: {
      xs: 0,
      fold: 280,
      sm: 600,
      md: 900,
      lg: 1200,
      desktop: 1300,
      xl: 1536,
    },
  },
});

export default function ThemeProvierContainer({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

ThemeProvierContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
