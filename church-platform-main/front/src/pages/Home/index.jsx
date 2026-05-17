import { Box } from '@mui/material';
import { styled } from '@mui/system';
import HomeBanner from './components/HomeBanner';
import NoticeBoard from './components/NoticeBoard';
import MediaBoard from './components/MediaBoard';
import WeeklyBoard from './components/WeeklyBoard';
import PhotoGallery from './components/PhotoGallery';

const NoticeWeekly = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('desktop')]: {
    marginTop: '60px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default function Home() {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <HomeBanner />

      <MediaBoard />

      <NoticeWeekly>
        <NoticeBoard />
        <WeeklyBoard />
      </NoticeWeekly>

      <PhotoGallery />
    </Box>
  );
}
