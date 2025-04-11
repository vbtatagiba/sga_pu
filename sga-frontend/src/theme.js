import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#221F77', // Azul escuro da logo
      light: '#32247B', // Azul roxo da logo
      dark: '#1A1755',
    },
    secondary: {
      main: '#8C1A3B', // Vermelho vinho da logo
      light: '#A32B4B',
      dark: '#6D142D',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#221F77',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#221F77',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    h5: {
      fontWeight: 600,
      color: '#8C1A3B',
    },
    h6: {
      fontWeight: 600,
      color: '#221F77',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(34, 31, 119, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
      },
    },
  },
});

export default theme;
