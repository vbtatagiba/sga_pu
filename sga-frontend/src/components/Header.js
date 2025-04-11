import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../assets/images/Logo_pu.png';

const Logo = styled('img')({
  height: '120px',
  marginRight: '70px',
});

const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', py: 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo src={logo} alt="Logo PU" />
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              fontSize: '1.8rem',
            }}
          >
            Sistema de Gestão de Atendimentos
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 