// 미디어 게시판
import React from 'react';
import { Box, styled } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'swiper/swiper-bundle.min.css';
import 'swiper/swiper.min.css';
import { BoardUrl } from '../../../api/urlDefine';
import useGetData from '../../../hooks/useGetData';

const Media = styled(Box)(({ theme }) => ({
  margin: '40px 16px 0px 16px',
  [theme.breakpoints.up('desktop')]: {
    margin: '60px 0px 0px 0px',
    backgroundImage: `url(/MediaBoardMain.svg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'bottom',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const MediaTitle = styled(Box)(({ theme }) => ({
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  [theme.breakpoints.up('desktop')]: {
    margin: '88px 0px 8px 0px ',
    width: '1180px',
    height: '44px',
    justifyContent: 'center',
  },
}));

const MTitleText1 = styled(Box)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: '30px',
  color: '#212529',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '32px',
    lineHeight: '44px',
    letterSpacing: '-0.6px',
  },
}));

const MTitleText2 = styled(Box)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '20px',
  color: 'rgba(33, 37, 41, 1)',
  cursor: 'pointer',
  display: 'flex',
  alignContent: 'center',
  position: 'absolute',
  right: '0px',
  [theme.breakpoints.up('desktop')]: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '-0.3px',
  },
}));

const SwiperContainer = styled(Box)({
  marginTop: '16px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const SwiperBox = styled(Box)(({ theme }) => ({
  width: '1150px',
  [theme.breakpoints.up('desktop')]: {
    width: '1180px',
    marginBottom: '88px',
  },
}));

const SlideBox = styled(Box)(({ theme }) => ({
  width: '260px',
  height: '264px',
  cursor: 'pointer',
  [theme.breakpoints.up('desktop')]: {
    width: '280px',
    height: '306px',
  },
}));

const SlideImage = styled(Box)(({ theme }) => ({
  width: '260px',
  height: '174px',
  borderRadius: '8px',
  overflow: 'hidden',
  [theme.breakpoints.up('desktop')]: {
    width: '280px',
    height: '193px',
  },
}));

const SlideCAT = styled(Box)(({ theme }) => ({
  height: '18px',
  marginTop: '16px',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '18px',
  letterSpacing: '-0.3px',
  color: 'rgba(73, 80, 87, 1)',
  [theme.breakpoints.up('desktop')]: {
    width: '280px',
  },
}));

const SlideTitle = styled(Box)(({ theme }) => ({
  width: '260px',
  height: '24px',
  marginTop: '8px',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '24px',
  letterSpacing: '-0.3px',
  color: 'rgba(33, 37, 41, 1)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.up('desktop')]: {
    width: '260px',
  },
}));

export default function MediaBoard() {
  const navigate = useNavigate();
  const url = BoardUrl.basicList(9);
  const { data } = useGetData(`${url}?limit=${5}&offset=${0}`, {
    count: 0,
    rows: [],
  });

  return (
    <Media>
      <MediaTitle>
        <MTitleText1>미디어</MTitleText1>
        <MTitleText2
          onClick={() => {
            navigate('/menu/9');
          }}
        >
          <img src="/boardmore.svg" alt="더보기>" />
        </MTitleText2>
      </MediaTitle>

      <SwiperContainer>
        {/* SwiperBox보다 화면의 width값이 클경우 중앙정렬을 위해 Box 추가 hidden 처리 */}
        <Box sx={{ overflow: 'hidden' }}>
          <SwiperBox>
            {/* 유튜브 영상 슬라이더 */}
            <Swiper
              spaceBetween={19}
              slidesPerView={4}
              loop
              loopedSlides={4}
              style={{
                width: '100%',
              }}
            >
              {data.rows.map(m => {
                let urlParams = '';
                let videoId = '';
                if (m.videoUrl) {
                  try {
                    urlParams = new URLSearchParams(
                      new URL(m?.videoUrl)?.search,
                    );
                    videoId = urlParams?.get('v') || '';
                    if (!videoId) {
                      // eslint-disable-next-line prefer-destructuring
                      videoId = m.videoUrl.split('/')[3];
                    }
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(e);
                  }
                }

                return (
                  <SwiperSlide key={m.id} style={{ overflow: 'hidden' }}>
                    <SlideBox
                      onClick={() => {
                        navigate(`/menu/9/board/basic/${m.id}`);
                      }}
                    >
                      <SlideImage>
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt="영상"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </SlideImage>
                      <SlideCAT>{moment(m.createdAt).format('LL')}</SlideCAT>
                      <SlideTitle>{m.title}</SlideTitle>
                    </SlideBox>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </SwiperBox>
        </Box>
      </SwiperContainer>
    </Media>
  );
}
