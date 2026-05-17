/* eslint-disable react/jsx-props-no-spreading */
import { useRef, useState } from 'react';
import { styled } from '@mui/system';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Grow,
  Paper,
  Popper,
  Stack,
  Toolbar,
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { menuState } from '../../atoms';
import Logo from '../../assets/svgs/logo.svg';
import useUser from '../../hooks/useUser';
import { menuType } from '../../define';
import { authApi } from '../../api/global';
import { showToastErrorObject } from '../../lib/utils';

const MenuButton = styled(Button)(({ theme }) => ({
  fontSize: '18px',
  minWidth: '150px',
  fontWeight: 700,
  color: '#495057',
  ':hover': {
    color: '#00B2B2',
    backgroundColor: 'transparent',
  },
  [theme.breakpoints.up('desktop')]: {},
}));

const SubButton = styled(Button)(({ theme }) => ({
  fontSize: '15px',
  minWidth: '150px',
  fontWeight: 400,
  color: '#212529',
  ':hover': {
    color: '#00B2B2',
    backgroundColor: 'transparent',
  },
  [theme.breakpoints.up('desktop')]: {},
}));

export default function PCToolbar() {
  const menus = useRecoilValue(menuState);
  const location = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const navigate = useNavigate();

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // eslint-disable-next-line no-unused-vars
  const logOut = async () => {
    try {
      authApi.logout();
      navigate(0);
    } catch (err) {
      showToastErrorObject(err);
    }
  };

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          justifyContent: 'center',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ height: '80px', paddingLeft: '0px' }} ref={anchorRef}>
          <Button
            sx={{ minWidth: '200px' }}
            onClick={() => {
              navigate('/');
              setOpen(false);
            }}
          >
            <img src={Logo} alt="logo" />
          </Button>
          <Stack direction="row" sx={{ flexGrow: 1, ml: '100px' }}>
            {menus?.map(menu => {
              return (
                <MenuButton
                  key={menu.id}
                  onClick={() => {}}
                  onMouseOver={() => setOpen(true)}
                >
                  {menu.title}
                </MenuButton>
              );
            })}
          </Stack>
          {user && (
            <Button
              variant="text"
              onClick={logOut}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'text.secondary',
                minWidth: 'auto',
                px: 2,
                py: 0.75,
                borderRadius: '20px',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'action.hover',
                },
              }}
              startIcon={<LogoutIcon sx={{ fontSize: '18px' }} />}
            >
              로그아웃
            </Button>
          )}
          {!user && (
            <Button
              variant="outlined"
              onClick={() => {
                navigate('/login');
              }}
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#00B2B2',
                borderColor: '#00B2B2',
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                borderRadius: '16px',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 178, 178, 0.08)',
                  borderColor: '#00C4C4',
                  color: '#00C4C4',
                },
              }}
              startIcon={<PersonOutlineIcon sx={{ fontSize: '16px' }} />}
            >
              로그인
            </Button>
          )}
        </Toolbar>
        <Divider />
      </AppBar>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        sx={{
          width: '100%',
          zIndex: 11000,
        }}
        onMouseLeave={handleClose}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: 'top center',
            }}
          >
            <Paper>
              <Box sx={{ ml: '300px' }}>
                <Stack direction="row" sx={{ flexGrow: 1 }}>
                  {menus?.map(menu => {
                    return (
                      <Stack key={menu.id}>
                        {menu.menus.map(m => {
                          if (m.type === menuType.Category) {
                            if (m.menus?.length > 0) {
                              return (
                                <SubButton
                                  key={m.id}
                                  onClick={() => {
                                    navigate(`/menu/${m.id}`);
                                    setOpen(false);
                                  }}
                                >
                                  {m.title}
                                </SubButton>
                              );
                            }
                            // eslint-disable-next-line react/jsx-no-useless-fragment
                            return <></>;
                          }
                          return (
                            <SubButton
                              key={m.id}
                              onClick={() => {
                                navigate(`/menu/${m.id}`);
                                setOpen(false);
                              }}
                            >
                              {m.title}
                            </SubButton>
                          );
                        })}
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
