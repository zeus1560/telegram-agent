import React from 'react';
import PropTypes from 'prop-types';
import { Box, ImageListItem, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

const CardView = ({ item, onClick, mobile }) => {
  const theme = useTheme();
  const Container = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '16px',
    marginBottom: '30px',
    [theme.breakpoints.up('desktop')]: {
      height: '185px',
      paddingRight: '22px',
      borderBottom: '1px solid #e6eaed',
      marginBottom: '40px',
    },
  });

  const imgUrl = item.images?.length > 0 ? item.images[0].location : '';

  return (
    <ImageListItem
      onClick={() => onClick(item.id)}
      sx={{
        cursor: 'pointer',
      }}
    >
      <Box display="flex" flexDirection="column">
        <img
          src={imgUrl}
          alt={item.title}
          style={{
            width: mobile ? '100%' : '302px',
            height: mobile ? '174px' : '160px',
            borderRadius: '8px',
            objectFit: 'cover',
          }}
        />
        <Container>
          <Box
            sx={{
              fontWeight: '500',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#212529',
              mt: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.title}
          </Box>
          <Box
            sx={{
              fontWeight: '400',
              fontSize: mobile ? '13px' : '14px',
              lineHeight: '16px',
              color: '#868e96',
              mt: '8px',
            }}
          >
            {item?.createdAt
              ? dayjs(new Date(item.createdAt)).format('YYYY.MM.DD')
              : ''}
          </Box>
        </Container>
      </Box>
    </ImageListItem>
  );
};

CardView.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    contents: PropTypes.string,
    videoUrl: PropTypes.string,
    createdAt: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    images: PropTypes.object,
  }),
  onClick: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
};

CardView.defaultProps = {
  item: null,
  mobile: false,
};

export default CardView;
