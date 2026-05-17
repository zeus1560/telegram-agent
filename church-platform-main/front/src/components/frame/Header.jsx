import { Box, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import MobileToolbar from './MobileToolbar';
import PCToolbar from './PCToolbar';

const Container = styled(Box)(() => ({
  whiteSpace: 'nowrap',
}));

export default function Header() {
  const isDeskTop = useMediaQuery(useTheme().breakpoints.up('desktop'));

  return <Container>{isDeskTop ? <PCToolbar /> : <MobileToolbar />}</Container>;
}
