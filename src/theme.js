
import { createTheme } from '@mui/material/styles';

const getAppTheme = (mode = 'light') => {
  const selectedMode =
    typeof mode === 'string' ? mode : mode?.mode || 'light';

  return createTheme({
    palette: {
      mode: selectedMode === 'dark' ? 'dark' : 'light',

      primary: {
        main: selectedMode === 'dark' ? '#90caf9' : '#1976d2',
      },

      secondary: {
        main: selectedMode === 'dark' ? '#ce93d8' : '#9c27b0',
      },

      background: {
        default: selectedMode === 'dark' ? '#121212' : '#f5f7fb',
        paper: selectedMode === 'dark' ? '#1a272aff' : '#ffffff',
      },

      text: {
        primary: selectedMode === 'dark' ? '#ffffff' : '#212121',
        secondary: selectedMode === 'dark' ? '#b0b0b0' : '#666666',
      },

      divider: selectedMode === 'dark' ? '#383838' : '#e0e0e0',
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            transition: 'background-color 0.2s ease',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};


export default getAppTheme;