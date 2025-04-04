import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // Azul escuro do site de referência
      light: '#336699',
      dark: '#002244',
    },
    secondary: {
      main: '#009933', // Verde do site de referência
      light: '#33cc66',
      dark: '#006622',
    },
    background: {
      default: '#f0f0f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#003366',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    h5: {
      fontWeight: 600,
      color: '#009933',
    },
    h6: {
      fontWeight: 600,
      color: '#333333',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
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
