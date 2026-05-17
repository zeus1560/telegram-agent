// 주보
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useGetData from '../../../hooks/useGetData';
import { BoardUrl } from '../../../api/urlDefine';

const WeeklyBoardBox = styled(Box)(({ theme }) => ({
  margin: '40px 16px 40px 16px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('desktop')]: {
    margin: '0px 50px 0px 0px',
    width: '560px',
    height: '208px',
  },
}));

const WeeklyTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const WTitle1 = styled(Box)(({ theme }) => ({
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

const WTitle2 = styled(Box)(({ theme }) => ({
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

const WSubBox = styled(Box)(({ theme }) => ({
  height: '50px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0px',
  borderBottom: '1px solid rgba(230, 234, 237, 1)',
  cursor: 'pointer',
  [theme.breakpoints.up('desktop')]: {
    height: '51px',
  },
}));

const WSubTitle = styled(Box)(({ theme }) => ({
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

const WSubAt = styled(Box)(({ theme }) => ({
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

export default function WeeklyBoard() {
  const navigate = useNavigate();

  const url = BoardUrl.basicList(26);
  const { data } = useGetData(`${url}?limit=${3}&offset=${0}`, {
    count: 0,
    rows: [],
  });

  return (
    <WeeklyBoardBox>
      <WeeklyTitle>
        <WTitle1>주보</WTitle1>
        <WTitle2
          onClick={() => {
            navigate('/menu/26');
          }}
        >
          <img
            src="/boardmore.svg"
            alt="더보기>"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </WTitle2>
      </WeeklyTitle>
      <Box
        sx={{
          borderTop: data.rows.length > 0 ? '1px solid #E6EAED' : 'none',
          marginTop: '20px',
        }}
      >
        {data.rows.map(weekly => (
          <WSubBox
            key={weekly.id}
            onClick={() => {
              navigate(`/menu/26/board/basic/${weekly.id}`);
            }}
          >
            <WSubTitle>{weekly.title}</WSubTitle>
            <WSubAt>{moment(weekly.createdAt).format('YYYY.MM.DD')}</WSubAt>
          </WSubBox>
        ))}
      </Box>
    </WeeklyBoardBox>
  );
}
