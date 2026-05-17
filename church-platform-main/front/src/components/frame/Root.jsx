import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/system';
import Header from './Header';

const Container = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('desktop')]: {
    marginTop: '80px',
  },
}));

function Root() {
  return (
    <Box>
      <Header />
      <Container>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Root;
