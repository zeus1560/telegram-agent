import { useState } from 'react';
import { Box, Typography, styled, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import { useRecoilValue } from 'recoil';
import RightIcon from '../../assets/imgs/m-arrow-right.svg?react';
import { menuState } from '../../atoms';
import SideBarCollaspeItem from './SideBarCollaspeItem';
import Logo from '../../assets/svgs/sidebar_logo.svg';

import { menuType } from '../../define';
import useUser from '../../hooks/useUser';
import { authApi } from '../../api/global';

function MenuTag({ menu, onClick, depth, menuOpenData, setMenuOpen, isLast }) {
  if (menu?.type === menuType.Category) {
    const findData = menuOpenData.find(i => i.id === menu.id);
    return (
      <>
        {depth === 1 && (
          <>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#868E96',
                lineHeight: '24px',
              }}
            >
              {menu.title}
            </Typography>
            <Box>
              {menu.menus?.map(m => (
                <MenuTag
                  menu={m}
                  key={m.id}
                  onClick={onClick}
                  depth={depth + 1}
                  menuOpenData={menuOpenData}
                  setMenuOpen={setMenuOpen}
                />
              ))}
            </Box>
          </>
        )}

        {depth === 2 && menu.menu?.length > 0 && (
          <SideBarCollaspeItem
            title={menu.title}
            enabled
            menuOpen={findData ? findData.open : true}
            onClick={() => {
              const find = menuOpenData.find(i => i.id === menu.id);
              if (!find) {
                setMenuOpen([...menuOpenData, { id: menu.id, open: false }]);
              } else {
                const newMenuOpenData = [];
                menuOpenData.forEach(newData => {
                  if (newData.id === menu.id) {
                    newMenuOpenData.push({
                      id: menu.id,
                      open: !find.open,
                    });
                  } else {
                    newMenuOpenData.push(newData);
                  }
                });
                setMenuOpen(newMenuOpenData);
              }
            }}
          >
            {menu.menu?.map(m => (
              <MenuTag
                menu={m}
                key={m.id}
                onClick={onClick}
                depth={depth + 1}
                menuOpenData={menuOpenData}
                setMenuOpen={setMenuOpen}
              />
            ))}
          </SideBarCollaspeItem>
        )}
        {depth === 1 && isLast === false && (
          <Divider sx={{ marginTop: '16px', marginBottom: '16px' }} />
        )}
      </>
    );
  }

  if (depth === 1) {
    return (
      <ListItemButton
        onClick={() => {
          onClick(menu?.id);
        }}
        sx={{ padding: 0, height: '40px' }}
      >
        <Typography
          sx={{ fontSize: '16px', fontWeight: 400, color: '#212529' }}
        >
          {menu?.title}
        </Typography>
      </ListItemButton>
    );
  }
  if (depth === 2) {
    return (
      <ListItemButton
        onClick={() => {
          onClick(menu?.id);
        }}
        sx={{ padding: 0, height: '40px' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 400,
              color: '#212529',
              flexGrow: 1,
            }}
          >
            {menu?.title}
          </Typography>
          <RightIcon />
        </Box>
      </ListItemButton>
    );
  }
  if (depth === 3) {
    return (
      <ListItemButton
        onClick={() => {
          onClick(menu?.id);
        }}
        sx={{ padding: 0, paddingTop: '4px', paddingBottom: '4px' }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#495057',
            lineHeight: '24px',
          }}
        >
          {menu?.title}
        </Typography>
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      onClick={() => {
        onClick(menu?.id);
      }}
      sx={{ padding: 0, height: '40px' }}
    >
      <Typography sx={{ fontSize: '16px', fontWeight: 400, color: '#212529' }}>
        {menu?.title}
      </Typography>
    </ListItemButton>
  );
}

MenuTag.defaultProps = {
  isLast: false,
};

MenuTag.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  menu: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  depth: PropTypes.number.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  menuOpenData: PropTypes.array.isRequired,
  setMenuOpen: PropTypes.func.isRequired,
  isLast: PropTypes.bool,
};

function Sidebar({ close }) {
  const menuList = useRecoilValue(menuState);
  const { user } = useUser();
  const [menuOpenData, setMenuOpen] = useState([]);
  const navigate = useNavigate();
  const handleClick = menuIdx => {
    close();
    navigate(`/menu/${menuIdx}`);
  };

  return (
    <Box>
      {/* Logo area */}
      <Box
        sx={{
          paddingTop: '15px',
          paddingBottom: '15px',
          backgroundColor: '#50AE55',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            paddingLeft: '16px',
            paddingRight: '20px',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => {
              close();
              navigate(`/`);
            }}
          >
            <img src={Logo} alt="logo" />
          </Button>
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={() => close()}>
              <CloseIcon width={16} height={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Divider />

      {/* Login / Logout */}
      {!user && (
        <Button
          sx={{ mt: '15px' }}
          onClick={() => {
            close();
            navigate('/login');
          }}
        >
          로그인
        </Button>
      )}
      {user && (
        <Button
          sx={{ mt: '15px' }}
          onClick={() => {
            close();
            authApi.logout();
            navigate(0);
          }}
        >
          로그아웃
        </Button>
      )}

      {/* Dynamic menu list */}
      <List sx={{ marginLeft: '16px', marginRight: '16px', marginTop: '10px' }}>
        {menuList.map((menu, index) => {
          return (
            <MenuTag
              menu={menu}
              key={menu.id}
              onClick={handleClick}
              depth={1}
              menuOpenData={menuOpenData}
              setMenuOpen={setMenuOpen}
              isLast={menuList.length - 1 === index}
            />
          );
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ ml: '16px', mr: '16px' }} />
      <Box
        sx={{
          fontWeight: 400,
          fontSize: '12px',
          color: '#495057',
          ml: '16px',
          pb: '24px',
          mt: '13px',
        }}
      >
        <div>&copy; All Rights Reserved.</div>
      </Box>
    </Box>
  );
}

Sidebar.propTypes = {
  close: PropTypes.func.isRequired,
};

export default Sidebar;
