// 공지사항
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useGetData from '../../../hooks/useGetData';
import { BoardUrl } from '../../../api/urlDefine';

const NoticeBoardBox = styled(Box)(({ theme }) => ({
  margin: '40px 16px 40px 16px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('desktop')]: {
    margin: '0px 50px 0px 60px',
    width: '560px',
    height: '208px',
  },
}));

const NoticeTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const NTitle1 = styled(Box)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '-0.3px',
  color: '#212529',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('desktop')]: {
    height: '34px',
    fontSize: '28px',
    lineHeight: '38px',
    letterSpacing: '-0.6px',
  },
}));

const NTitle2 = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  [theme.breakpoints.up('desktop')]: {
    width: '52px',
    height: '20px',
  },
}));

const NSubBox = styled(Box)(({ theme }) => ({
  height: '50px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0px',
  borderBottom: '1px solid #E6EAED',
  cursor: 'pointer',
  [theme.breakpoints.up('desktop')]: {
    height: '51px',
  },
}));

const NSubTitle = styled(Box)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '14px',
  color: 'rgba(33, 37, 41, 1)',
  letterSpacing: '-0.3px',
  lineHeight: '26px',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '16px',
  },
}));

const NSubAt = styled(Box)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '13px',
  color: 'rgba(144, 148, 156, 1)',
  lineHeight: '18px',
  letterSpacing: '-0.3px',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '14px',
    lineHeight: '20px',
  },
}));

export default function NoticeBoard() {
  const navigate = useNavigate();

  const url = BoardUrl.basicList(27);
  const { data } = useGetData(`${url}?limit=${3}&offset=${0}`, {
    count: 0,
    rows: [],
  });

  return (
    <NoticeBoardBox>
      <NoticeTitle>
        <NTitle1>공지사항</NTitle1>
        <NTitle2
          onClick={() => {
            navigate('/menu/27');
          }}
        >
          <img
            src="/boardmore.svg"
            alt="더보기>"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </NTitle2>
      </NoticeTitle>
      <Box
        sx={{
          borderTop: data.rows.length > 0 ? '1px solid #E6EAED' : 'none',
          marginTop: '20px',
        }}
      >
        {data.rows.map(notice => (
          <NSubBox
            key={notice.id}
            onClick={() => {
              navigate(`/menu/27/board/basic/${notice.id}`);
            }}
          >
            <NSubTitle>{notice.title}</NSubTitle>
            <NSubAt>{moment(notice.createdAt).format('YYYY.MM.DD')}</NSubAt>
          </NSubBox>
        ))}
      </Box>
    </NoticeBoardBox>
  );
}
