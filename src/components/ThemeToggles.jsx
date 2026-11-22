
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';

export default function ThemeToggle({ mode, onChange }) {
  const handleToggle = () => {
    onChange(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={handleToggle}
        color="inherit"
        aria-label="Toggle dark mode"
        sx={{
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {mode === 'dark' ? (
          <LightModeRoundedIcon />
        ) : (
          <DarkModeRoundedIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
