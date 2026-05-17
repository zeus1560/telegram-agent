import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { menuType } from '../define';
import { findMenuById } from '../lib/utils';
import CommonList from './board/CommonList';
import useGetData from '../hooks/useGetData';
import { MenuUrl } from '../api/urlDefine';

function MenuRoot() {
  const { id } = useParams();
  const { data: menus } = useGetData(MenuUrl.list, []);
  const findMenu = findMenuById(menus, parseInt(id, 10));

  if (
    findMenu?.type === menuType.Basic ||
    findMenu?.type === menuType.Sermon ||
    findMenu?.type === menuType.Gallery ||
    findMenu?.type === menuType.Card
  ) {
    return <CommonList menu={findMenu} />;
  }

  return (
    <Box>
      <Typography variant="h5">메뉴 루트</Typography>
      <Typography variant="subtitle1">id: {findMenu?.id}</Typography>
      <Typography variant="subtitle1">type: {findMenu?.type}</Typography>
      <Typography variant="subtitle1">title: {findMenu?.title}</Typography>
    </Box>
  );
}

export default MenuRoot;
