import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useParams } from 'react-router-dom';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import Sidebar from './Sidebar';
import { menuState } from '../../atoms';
import { findMenuById } from '../../lib/utils';
import Logo from '../../assets/svgs/logo.svg';

export default function MobileToolbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { menuId } = useParams();
  const menus = useRecoilValue(menuState);
  const findMenu = findMenuById(menus, parseInt(menuId, 10));

  return (
    <Box sx={{ minHeight: '48px' }}>
      <AppBar
        component="nav"
        sx={{
          minHeight: '48px',
          backgroundColor: 'white',
          justifyContent: 'center',
          boxShadow: 'none',
          borderBottom: '1px solid #E6EAED',
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{
                fontSize: '18px',
                color: '#212529',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {findMenu?.title ? (
                findMenu?.title
              ) : (
                <img
                  src={Logo}
                  alt="logo"
                  style={{ width: '120px', height: '20px' }}
                />
              )}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: '100%' } }}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          <Sidebar close={() => setOpen(false)} />
        </Box>
      </Drawer>
    </Box>
  );
}
