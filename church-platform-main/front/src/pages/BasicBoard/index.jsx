import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, styled } from '@mui/material';
import dayjs from 'dayjs';
import moment from 'moment';
import BasicTable from './components/BasicTable';
import Pagenation from '../../components/common/Pagenation';
import NewIcon from '../../assets/images/ic-new.svg?react';
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

const BasicBoard = ({ menu, page, page_size }) => {
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

  const numbering = true;
  const [currentPage, setCurrentPage] = useState(Number(page));
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('desktop'));
  const params = {
    page,
    page_size,
  };
  const handleClickItem = id => {
    navigate(`/menu/${menu.id}/board/basic/${id}`);
  };

  const TableHeader = [];
  if (!isMobile) {
    TableHeader.push({
      accessor: 'rownum',
      Header: '',
      Cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box
            sx={{
              fontWeight: '400',
              fontSize: '15px',
              lineHeight: '24px',
              color: '#212529',
              display: 'flex',
              height: '100%',
              alignItems: 'center',
            }}
          >
            {rowData.id}
          </Box>
        );
      },
    });
    TableHeader.push({
      accessor: 'title',
      Header: '',
      Cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: 'pointer', width: '100%' }}
            onClick={() => handleClickItem(rowData.id)}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              flexGrow={1}
            >
              <Box display="flex">
                <Box
                  sx={{
                    fontWeight: '400',
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: isMobile ? '20px' : '24px',
                    color: '#90949c',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {numbering && rowData.createdAt
                    ? dayjs(new Date(rowData.createdAt)).format('YYYY.MM.DD')
                    : ''}
                </Box>
              </Box>
              <Box display="flex" alignItems="baseline" sx={{ mt: '8px' }}>
                {rowData.important_yn === 'Y' ? (
                  <Box
                    sx={{
                      width: '27px',
                      minWidth: '27px',
                      height: '18px',
                      bgcolor: '#00c4c4',
                      borderRadius: '3px',
                      fontWeight: '700',
                      fontSize: '10px',
                      lineHeight: '14px',
                      color: '#fff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mr: '12px',
                    }}
                  >
                    중요
                  </Box>
                ) : null}
                <Box
                  sx={{
                    fontWeight: isMobile ? '500' : '400',
                    fontSize: isMobile ? '16px' : '20px',
                    lineHeight: '28px',
                    color: '#212529',
                    display: 'flex',
                    alignItems: 'center',
                    wordBreak: 'break-all',
                  }}
                >
                  {rowData.title}
                </Box>
                {moment(rowData.createdAt).format('YYYY-MM-DD') ===
                moment().format('YYYY-MM-DD') ? (
                  <Box>
                    <NewIcon
                      style={{ marginLeft: isMobile ? '8px' : '12px' }}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>
            {rowData.image_url && rowData.image_use_yn === 'Y' ? (
              <Box
                component="img"
                alt="image"
                sx={{
                  height: '120px',
                  width: '200px',
                  borderRadius: '0px',
                  ml: '20px',
                }}
                src={rowData.image_url}
              />
            ) : null}
          </Box>
        );
      },
    });
  } else {
    TableHeader.push({
      accessor: 'title',
      Header: '',
      Cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: 'pointer', width: '100%' }}
            onClick={() => handleClickItem(rowData.id)}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              flexGrow={1}
            >
              <Box display="flex">
                <Box
                  sx={{
                    fontWeight: '400',
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: isMobile ? '20px' : '24px',
                    color: '#90949c',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {numbering && rowData.createdAt
                    ? dayjs(new Date(rowData.createdAt)).format('YYYY.MM.DD')
                    : ''}
                </Box>
              </Box>
              <Box display="flex">
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-start"
                  flexGrow={1}
                >
                  <Box display="flex" alignItems="baseline" sx={{ mt: '8px' }}>
                    {rowData.important_yn === 'Y' ? (
                      <Box
                        sx={{
                          width: '27px',
                          minWidth: '27px',
                          height: '18px',
                          bgcolor: '#00c4c4',
                          borderRadius: '3px',
                          fontWeight: '700',
                          fontSize: '10px',
                          lineHeight: '14px',
                          color: '#fff',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mr: '12px',
                        }}
                      >
                        중요
                      </Box>
                    ) : null}
                    <Box
                      sx={{
                        fontWeight: isMobile ? '500' : '400',
                        fontSize: isMobile ? '16px' : '20px',
                        lineHeight: '28px',
                        color: '#212529',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 2,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        textAlign: 'left',
                        wordBreak: 'break-all',
                      }}
                    >
                      {rowData.title}
                    </Box>
                    {moment(rowData.createdAt).format('YYYY-MM-DD') ===
                    moment().format('YYYY-MM-DD') ? (
                      <Box>
                        <NewIcon
                          style={{ marginLeft: isMobile ? '8px' : '12px' }}
                        />
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                {rowData.image_url && rowData.image_use_yn === 'Y' ? (
                  <Box
                    component="img"
                    alt="image"
                    sx={{
                      height: '60px',
                      width: '105px',
                      borderRadius: '0px',
                      ml: '20px',
                      mt: '10px',
                    }}
                    src={rowData.image_url}
                  />
                ) : null}
              </Box>
            </Box>
          </Box>
        );
      },
    });
  }

  const handlePage = changed_page => {
    setCurrentPage(changed_page);
    navigate(
      `/menu/${menu.id}?page=${changed_page}&search=${params.search_text}`,
    );
  };

  return (
    <Container sx={{ width: '100%' }}>
      <BasicTable
        columns={TableHeader}
        data={dataList.list}
        numbering={numbering}
        mobile={isMobile}
      />
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

BasicBoard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  menu: PropTypes.object.isRequired,
  page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  page_size: PropTypes.number,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      contents: PropTypes.string,
      image_url: PropTypes.string,
      image_use_yn: PropTypes.string,
      important_yn: PropTypes.string,
      createdAt: PropTypes.string,
    }),
  }),
};

BasicBoard.defaultProps = {
  row: null,
  page: 1,
  page_size: 10,
};

export default BasicBoard;
