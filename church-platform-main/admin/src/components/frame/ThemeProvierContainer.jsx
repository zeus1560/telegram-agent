import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../assets/scss/styles.scss';
import theme from './themeSetting';

export default function ThemeProvierContainer({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

ThemeProvierContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
