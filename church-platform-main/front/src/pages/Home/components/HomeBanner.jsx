import { Box } from '@mui/material';
import styled from '@emotion/styled';

const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  [theme.breakpoints.up('desktop')]: {
    height: '400px',
  },
}));

const Title = styled(Box)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '24px',
  color: '#333',
  textAlign: 'center',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '36px',
  },
}));

export default function HomeBannerSlide() {
  return (
    <Container>
      <Title>Welcome to Our Platform</Title>
    </Container>
  );
}
