import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/global';
import { showToastErrorObject } from '../lib/utils';

export default function AdminLogin() {
  const { register, watch } = useForm();

  const send = async () => {
    const mail = watch('mail');
    const password = watch('password');
    try {
      await authApi.adminLogin(mail, password);
      window.location.replace('/admin');
    } catch (err) {
      showToastErrorObject(err);
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      send();
    }
  };

  return (
    <Box sx={{ width: '500px', ml: 'auto', mr: 'auto', mt: '50px' }}>
      <Typography
        variant="h4"
        sx={{ textAlign: 'center', mt: '50px', mb: '30px' }}
      >
        관리자 로그인
      </Typography>
      <Box>
        <TextField fullWidth label="이메일" {...register('mail')} />
      </Box>
      <Box sx={{ mt: '30px', mb: '50px' }}>
        <TextField
          fullWidth
          label="패스워드"
          type="password"
          {...register('password')}
          onKeyDown={handleKeyDown}
        />
      </Box>
      <Button variant="contained" fullWidth onClick={send}>
        로그인
      </Button>
    </Box>
  );
}
