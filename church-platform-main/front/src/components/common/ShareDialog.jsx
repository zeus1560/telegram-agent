import React from 'react';
import { Dialog, Box, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import IconClose from '../../assets/images/ic_close.svg?react';
import IconKakao from '../../assets/images/ic_kakao.svg?react';
import IconLink from '../../assets/images/ic_copy.svg?react';

const ShareDialog = ({ onClose, open, mobile, onEvent }) => {
  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  const handleClickKakao = () => {
    onEvent(1);
    onClose();
  };

  const handleClickLink = () => {
    onClose();
    setTimeout(() => {
      onEvent(2);
    }, 500);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      PaperProps={{ style: { borderRadius: mobile ? '3px' : '10px' } }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          minWidth: mobile ? '295px' : '400px',
          width: mobile ? '295px' : '400px',
          height: '184px',
          p: mobile ? '20px' : '24px',
        }}
        alignItems="center"
      >
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              fontWeight: '700',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#212529',
            }}
          >
            공유하기
          </Box>
          <IconButton onClick={onClose} sx={{ mt: '-5px' }}>
            <IconClose />
          </IconButton>
        </Box>
        <Box display="flex" sx={{ mt: '15px' }}>
          <Box display="flex" flexDirection="column" sx={{ mr: '40px' }}>
            <IconKakao
              onClick={handleClickKakao}
              style={{ cursor: 'pointer' }}
            />
            <Box
              sx={{
                fontWeight: '400',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#212529',
                mt: '3px',
              }}
            >
              카카오톡
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" sx={{ ml: '40px' }}>
            <IconLink onClick={handleClickLink} style={{ cursor: 'pointer' }} />
            <Box
              sx={{
                fontWeight: '400',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#212529',
                mt: '3px',
              }}
            >
              링크복사
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

ShareDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onEvent: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  mobile: PropTypes.bool,
};

ShareDialog.defaultProps = {
  mobile: false,
};

export default ShareDialog;
