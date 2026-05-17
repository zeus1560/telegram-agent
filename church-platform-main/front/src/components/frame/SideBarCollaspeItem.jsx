import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, Typography, Box, ListItemButton } from '@mui/material';
import UpIcon from '../../assets/imgs/m-arrow-up.svg?react';
import DownIcon from '../../assets/imgs/m-arrow-down.svg?react';

function SideBarCollaspeItem({ title, children, menuOpen, onClick }) {
  const handleClick = () => {
    onClick();
  };
  return (
    <Box sx={{ marginBottom: '16px' }}>
      <ListItemButton onClick={handleClick} sx={{ padding: 0, height: '40px' }}>
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#212529',
            lineHeight: '40px',
            flexGrow: 1,
          }}
        >
          {title}
        </Typography>
        {menuOpen ? <UpIcon /> : <DownIcon />}
      </ListItemButton>
      <Collapse in={menuOpen} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </Box>
  );
}

SideBarCollaspeItem.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

SideBarCollaspeItem.defaultProps = {
  children: null,
};

export default SideBarCollaspeItem;
