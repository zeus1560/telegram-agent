import { useState } from 'react';
import {
  Drawer as MuiDrawer,
  Typography,
  List,
  Box,
  styled,
} from '@mui/material';
import PropTypes from 'prop-types';
import { SidebarWidth } from '../../define';
import SidebarItemContainer from './SidebarItemContainer';
import SidebarItem from './SidebarItem';
import useGetData from '../../hooks/useGetData';
import { MenuUrl } from '../../api/urlDefine';

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: '240px',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: 0.1,
      [theme.breakpoints.up('sm')]: {
        // width: theme.spacing(9),
      },
    }),
  },
}));

function Sidebar({ open }) {
  const [openMenu01, setOpenMenu01] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);

  const { data: menus } = useGetData(MenuUrl.list, []);

  return (
    <Drawer
      sx={{
        width: open ? SidebarWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SidebarWidth : 0,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
      open={open}
    >
      <Typography
        sx={{
          textAlign: 'center',
          mt: '23px',
          fontWeight: 700,
          fontSize: '19px',
          lineHeight: '18px',
          color: '#444444',
        }}
      >
        관리자
      </Typography>
      <Box sx={{ mt: '40px' }}>
        <List>
          <SidebarItemContainer
            title="관리자 메뉴"
            menuOpen={openMenu01}
            onClick={() => {
              setOpenMenu01(!openMenu01);
            }}
          >
            <SidebarItem title="유저 관리" to="/user" />
            <SidebarItem title="메뉴 관리" to="/manage-menu" />
          </SidebarItemContainer>
          {menus?.map(menu => {
            const findData = openMenus.find(i => i.id === menu.id);
            const displayMenu = menu.menus.filter(i => i.type !== 6);
            if (displayMenu.length === 0) {
              return null;
            }
            return (
              <SidebarItemContainer
                key={menu.id}
                title={menu.title}
                menuOpen={findData ? findData.open : true}
                onClick={() => {
                  // setOpenMenu01(!openMenu01);
                  const find = openMenus.find(i => i.id === menu.id);
                  if (find) {
                    const newMenuOpenData = [];
                    openMenus.forEach(newData => {
                      if (newData.id === menu.id) {
                        newMenuOpenData.push({
                          id: menu.id,
                          open: !find.open,
                        });
                      } else {
                        newMenuOpenData.push(newData);
                      }
                    });
                    setOpenMenus(newMenuOpenData);
                  } else {
                    setOpenMenus([...openMenus, { id: menu.id, open: false }]);
                  }
                }}
              >
                {menu.menus.map(subMenu => {
                  if (subMenu.type === 6) {
                    // 커스텀 페이지는 편집이 없으므로 어드민에서 현재는 필요하지 않다.
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    return <></>;
                  }
                  return (
                    <SidebarItem
                      key={subMenu.id}
                      title={subMenu.title}
                      to={`/menu/${subMenu.id}`}
                    />
                  );
                })}
              </SidebarItemContainer>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Sidebar;
