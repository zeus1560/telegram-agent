import { Dialog, TextField, Box, Button } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { userApi } from '../../api/user';

function AddUserDialog({ onClose, open }) {
  const handleSubmit = async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await userApi.add({
        name: formData.get('name'),
        mail: formData.get('mail'),
        password: formData.get('password'),
      });
      onClose(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      onClose();
    }
  };

  const handleColose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleColose} open={open}>
      <DialogTitle>유저 추가</DialogTitle>
      <Box
        sx={{ padding: 3, paddingTop: 0 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="mail"
          label="이메일"
          name="mail"
          autoComplete="mail"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="패스워드"
          type="password"
          name="password"
          autoComplete="password"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="이름"
          type="name"
          name="name"
          autoComplete="name"
          autoFocus
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          확인
        </Button>
      </Box>
    </Dialog>
  );
}

export default AddUserDialog;
