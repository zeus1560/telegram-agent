import React from 'react';
import { Box } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { styled } from '@mui/system';
import { useRecoilValue } from 'recoil';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { menuState } from '../../atoms';
import { findMenuById } from '../../lib/utils';
import { menuType } from '../../define';
import BasicBoard from '../BasicBoard';
import SermonBoard from '../SermonBoard';
import CardBoard from '../CardBoard';

const MyContainer = styled(Box)(({ theme }) => ({
  // mobile
  width: '100%',
  [theme.breakpoints.up('desktop')]: {
    paddingTop: '80px',
    minWidth: '1097px',
  },
}));

export default function MenuRoot() {
  const { menuId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page');
  const menus = useRecoilValue(menuState);
  const findMenu = findMenuById(menus, parseInt(menuId, 10));
  const isMobile = useMediaQuery(useTheme().breakpoints.down('desktop'));
  window.scrollTo(0, 0);

  if (
    findMenu?.type === menuType.Basic ||
    findMenu?.type === menuType.Sermon ||
    findMenu?.type === menuType.Card ||
    findMenu?.type === menuType.Gallery
  ) {
    return (
      <Box sx={{ width: '100%' }} display="flex" justifyContent="center">
        <MyContainer
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            maxWidth: isMobile ? '100%' : '1300px',
            width: isMobile ? '100%' : '1300px',
          }}
        >
          {findMenu.type === menuType.Basic && (
            <BasicBoard menu={findMenu} page={parseInt(page, 10) || 1} />
          )}
          {findMenu.type === menuType.Sermon && (
            <SermonBoard menu={findMenu} page={parseInt(page, 10) || 1} />
          )}
          {findMenu.type === menuType.Card && (
            <CardBoard menu={findMenu} page={parseInt(page, 10) || 1} />
          )}
          {findMenu.type === menuType.Gallery && (
            <CardBoard menu={findMenu} page={parseInt(page, 10) || 1} />
          )}
        </MyContainer>
      </Box>
    );
  }

  return <Box sx={{}}>{findMenu?.type}</Box>;
}
