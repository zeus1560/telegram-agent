import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Collapse,
  Paper,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { menuType } from '../../define';

function MenuTreeItem({
  menu,
  onEdit,
  onDelete,
  onAddChild,
  level = 0,
  isExpanded,
  onToggle,
}) {
  const hasChildren = menu.menus && menu.menus.length > 0;
  const isCategory = menu.type === menuType.Category;

  const getMenuTypeLabel = type => {
    const types = {
      [menuType.Category]: '카테고리',
      [menuType.Basic]: '일반',
      [menuType.Sermon]: '영상',
      [menuType.Gallery]: '갤러리',
      [menuType.Page]: '페이지',
      [menuType.Custom]: 'custom',
      [menuType.Card]: '카드',
    };
    return types[type] || '알수없음';
  };

  return (
    <Box sx={{ ml: level * 3 }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isCategory ? '#f5f5f5' : 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {hasChildren && (
            <IconButton size="small" onClick={() => onToggle(menu.id)}>
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 40 }} />}

          <Box sx={{ ml: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {menu.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {menu.id} | 타입: {getMenuTypeLabel(menu.type)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {isCategory && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add />}
              onClick={() => onAddChild(menu)}
            >
              하위메뉴 추가
            </Button>
          )}
          <IconButton size="small" color="primary" onClick={() => onEdit(menu)}>
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(menu.id)}
          >
            <Delete />
          </IconButton>
        </Box>
      </Paper>

      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2 }}>
            {menu.menus.map(childMenu => (
              <MenuTreeItem
                key={childMenu.id}
                menu={childMenu}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                level={level + 1}
                isExpanded={isExpanded}
                onToggle={onToggle}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export default MenuTreeItem;
