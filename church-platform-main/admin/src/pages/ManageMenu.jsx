import { Box, Typography, Button } from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useGetQuery from '../hooks/useGetData';
import { menuApi } from '../api/global';
import MenuTreeItem from '../components/menu/MenuTreeItem';
import MenuDialog from '../components/menu/MenuDialog';

function ManageMenu() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const { data: menuList, refetch } = useGetQuery('menu', []);

  // 전체 메뉴 리스트 (상위, 하위 포함)
  const getAllMenus = () => {
    const allMenus = [];
    menuList.forEach(menu => {
      allMenus.push(menu);
      if (menu.menus) {
        allMenus.push(...menu.menus);
      }
    });
    return allMenus;
  };

  const handleToggle = menuId => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleAdd = () => {
    setEditData(null);
    setOpenDialog(true);
  };

  const handleEdit = menu => {
    setEditData(menu);
    setOpenDialog(true);
  };

  const handleAddChild = parentMenu => {
    setEditData({ parentMenuId: parentMenu.id });
    setOpenDialog(true);
  };

  const handleDelete = async menuId => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await menuApi.delete(menuId);
        toast.success('삭제되었습니다.');
        refetch();
      } catch (err) {
        toast.error('삭제에 실패했습니다.');
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
  };

  const handleDialogClose = isChanged => {
    const isEdit = editData && editData.id;
    setOpenDialog(false);
    setEditData(null);
    if (isChanged) {
      toast.success(isEdit ? '수정되었습니다.' : '추가되었습니다.');
      refetch();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">메뉴 관리</Typography>
        <Button variant="contained" onClick={handleAdd}>
          최상위 메뉴 추가
        </Button>
      </Box>

      <Box>
        {menuList.map(menu => (
          <MenuTreeItem
            key={menu.id}
            menu={menu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            isExpanded={expandedMenus[menu.id]}
            onToggle={handleToggle}
          />
        ))}
      </Box>

      <MenuDialog
        open={openDialog}
        onClose={handleDialogClose}
        editData={editData}
        menuList={getAllMenus()}
      />
    </Box>
  );
}

export default ManageMenu;
