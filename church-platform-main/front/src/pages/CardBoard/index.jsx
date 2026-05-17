import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, ImageList, styled } from '@mui/material';
import Pagenation from '../../components/common/Pagenation';
import CardView from './components/CardView';
import useGetData from '../../hooks/useGetData';
import { BoardUrl } from '../../api/urlDefine';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('desktop')]: {
    minWidth: '360px',
  },
}));

const EmptyBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '400px',
  color: '#495057',
  fontWeight: '400',
  fontSize: '15px',
  lineHeight: '24px',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '18px',
    lineHeight: '28px',
  },
}));

const CardBoard = ({ menu, page, page_size }) => {
  const url = BoardUrl.basicList(menu.id);
  const { data: resData } = useGetData(
    `${url}?limit=${page_size}&offset=${(page - 1) * 10}`,
    {
      count: 0,
      rows: [],
    },
  );
  const dataList = {
    list: resData.rows,
    total_count: resData.count,
    page_row: page_size,
  };
  const [currentPage, setCurrentPage] = useState(Number(page));
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('desktop'));
  const handleClickItem = id => {
    navigate(`/menu/${menu.id}/board/basic/${id}`);
  };

  const handlePage = changed_page => {
    setCurrentPage(changed_page);
    navigate(`/menu/${menu.id}?page=${changed_page}`);
  };

  return (
    <Container sx={{ width: '100%' }}>
      {isMobile ? (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pr: '16px',
            pl: '16px',
            mt: '30px',
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%', mt: '18px' }}
          >
            <Box
              sx={{
                fontWeight: '700',
                fontSize: '14px',
                lineHeight: '28px',
                color: '#212529',
              }}
            >
              {dataList.board_title}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              fontWeight: '700',
              fontSize: '24px',
              lineHeight: '34px',
              color: '#212529',
            }}
          >
            {dataList.board_title}
          </Box>
        </Box>
      )}
      <ImageList
        cols={isMobile ? 1 : 4}
        sx={{
          width: '100%',
          overflow: 'hidden',
          pr: isMobile ? '16px' : '0px',
          pl: isMobile ? '16px' : '0px',
        }}
        gap={0}
      >
        {dataList?.list.map(item => {
          return (
            <CardView
              key={item.id}
              item={item}
              onClick={handleClickItem}
              mobile={isMobile}
            />
          );
        })}
      </ImageList>
      {dataList.list.length === 0 ? null : (
        <Pagenation
          sx={
            isMobile
              ? {
                  mt: '30px',
                  pr: '16px',
                  pl: '16px',
                  width: '100%',
                }
              : { mt: '30px' }
          }
          key={menu.id}
          currentPage={currentPage}
          pageChangeHandler={handlePage}
          totalRows={dataList.total_count}
          rowsPerPage={dataList.page_row}
          mobile={isMobile}
        />
      )}
      {dataList.list.length === 0 ? (
        <EmptyBox>등록된 글이 없습니다.</EmptyBox>
      ) : null}
    </Container>
  );
};

CardBoard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  menu: PropTypes.object.isRequired,
  page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  page_size: PropTypes.number,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      contents: PropTypes.string,
      createdAt: PropTypes.bool,
    }),
  }),
};

CardBoard.defaultProps = {
  row: null,
  page: 1,
  page_size: 10,
};

export default CardBoard;
