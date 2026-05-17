import {
  Dialog,
  TextField,
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/global';
import { menuType } from '../../define';
import QuillEditor from '../../lib/QuillEditor';

function MenuDialog({ onClose, open, editData, menuList }) {
  const [type, setType] = useState(menuType.Basic);
  const [title, setTitle] = useState('');
  const [parentMenuId, setParentMenuId] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editData) {
      setType(editData.type || menuType.Basic);
      setTitle(editData.title || '');
      setParentMenuId(editData.parentMenuId || '');
      setContent(editData.content || '');
    } else {
      setType(menuType.Basic);
      setTitle('');
      setParentMenuId('');
      setContent('');
    }
  }, [editData, open]);

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      const data = {
        type,
        title,
        parentMenuId: parentMenuId || null,
        content: type === menuType.Page ? content : null,
      };

      if (editData && editData.id) {
        await menuApi.update(editData.id, data);
      } else {
        await menuApi.add(data);
      }
      onClose(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // 상위 메뉴 목록 (Category 타입만)
  const parentMenuOptions = menuList.filter(
    menu => menu.type === menuType.Category,
  );

  const menuTypeOptions = [
    { value: menuType.Category, label: '카테고리' },
    { value: menuType.Basic, label: '일반' },
    { value: menuType.Sermon, label: '영상' },
    { value: menuType.Gallery, label: '갤러리' },
    { value: menuType.Page, label: '페이지' },
    { value: menuType.Custom, label: 'custom' },
    { value: menuType.Card, label: '카드' },
  ];

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        {editData && editData.id ? '메뉴 수정' : '메뉴 추가'}
      </DialogTitle>
      <Box
        sx={{ padding: 3, paddingTop: 0 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="type-label">메뉴 타입</InputLabel>
          <Select
            labelId="type-label"
            id="type"
            value={type}
            label="메뉴 타입"
            onChange={e => setType(e.target.value)}
          >
            {menuTypeOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="메뉴 제목"
          name="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        {type !== menuType.Category && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="parent-label">상위 메뉴</InputLabel>
            <Select
              labelId="parent-label"
              id="parentMenuId"
              value={parentMenuId}
              label="상위 메뉴"
              onChange={e => setParentMenuId(e.target.value)}
            >
              <MenuItem value="">없음 (최상위)</MenuItem>
              {parentMenuOptions.map(menu => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {type === menuType.Page && (
          <Box sx={{ mt: 2 }}>
            <QuillEditor value={content} onChange={setContent} />
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          {editData && editData.id ? '수정' : '추가'}
        </Button>
      </Box>
    </Dialog>
  );
}

export default MenuDialog;
