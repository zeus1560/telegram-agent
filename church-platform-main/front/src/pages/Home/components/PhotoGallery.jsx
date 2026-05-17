// 갤러리
import React from 'react';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { BoardUrl } from '../../../api/urlDefine';
import useGetData from '../../../hooks/useGetData';

const GalleryBox = styled(Box)(({ theme }) => ({
  margin: '40px 16px 0px 16px',
  flexDirection: 'column',
  [theme.breakpoints.up('desktop')]: {
    margin: '60px 0px 0px 0px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const GTitleBox = styled(Box)(({ theme }) => ({
  height: '28px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  [theme.breakpoints.up('desktop')]: {
    width: '1180px',
    height: '34px',
  },
}));

const TitleBox1 = styled(Box)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: '30px',
  color: '#212529',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '28px',
    lineHeight: '38px',
    letterSpacing: '-0.6px',
  },
}));

const TitleBox2 = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('desktop')]: {
    width: '52px',
    height: '20px',
  },
}));

const ListBox = styled(Box)(({ theme }) => ({
  marginTop: '10px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
  gap: '10px',
  [theme.breakpoints.up('desktop')]: {
    width: '1180px',
    marginTop: '16px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(192px, 1fr))',
  },
}));

const PhotoBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '108px',
  overflow: 'hidden',
  [theme.breakpoints.up('desktop')]: {
    width: '100%',
    height: '174px',
  },
}));

// menu/28
export default function PhotoGallery() {
  const navigate = useNavigate();
  const url = BoardUrl.basicList(28);
  const { data } = useGetData(`${url}?limit=${10}&offset=${0}`, {
    count: 0,
    rows: [],
  });

  return (
    <GalleryBox>
      <GTitleBox>
        <TitleBox1>갤러리</TitleBox1>
        <TitleBox2
          onClick={() => {
            navigate('/menu/28');
          }}
        >
          <img
            src="/boardmore.svg"
            alt="더보기>"
            style={{ width: '100%', height: '100%' }}
          />
        </TitleBox2>
      </GTitleBox>

      <ListBox>
        {data.rows.map(p => {
          return (
            <PhotoBox
              key={p.id}
              onClick={() => {
                navigate(`/menu/28/board/basic/${p.id}`);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <img
                src={p.images[0]?.location}
                alt="갤러리 사진"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </PhotoBox>
          );
        })}
      </ListBox>
    </GalleryBox>
  );
}
