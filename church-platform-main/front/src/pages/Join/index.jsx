import { useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  Container,
  Button,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Copyright from '../../components/common/Copyright';
import { authApi } from '../../api/global';

const brandColor = '#00B2B2';
const brandHover = '#00C4C4';

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F4F6',
    '& fieldset': {
      borderColor: '#e6eaed',
    },
    '&:hover fieldset': {
      borderColor: brandColor,
    },
    '&.Mui-focused fieldset': {
      borderColor: brandColor,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: brandColor,
  },
};

const Join = () => {
  const navigate = useNavigate();
  const { register, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const send = async event => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    const mail = watch('mail');
    const password = watch('password1');
    const password2 = watch('password2');
    const name = watch('name');
    const phone = watch('phone');

    if (mail.length < 1) {
      alert('이메일을 입력해주세요');
      return;
    }

    if (password.length < 8) {
      alert('비밀번호는 8자리 이상이어야 합니다');
      return;
    }

    if (password !== password2) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    if (name.length < 1) {
      alert('이름을 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.join({ mail, password, name, phone });
      window.alert('회원가입이 완료되었습니다');
      navigate('/login');
    } catch (err) {
      alert(err?.response?.data?.message);
    }

    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        px: 2,
        py: 4,
      }}
    >
      <Container
        component="main"
        maxWidth={false}
        disableGutters
        sx={{ maxWidth: '520px' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '24px',
            border: '1px solid #e6eaed',
            backgroundColor: '#fff',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Brand heading */}
            <Typography
              component="a"
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '13px',
                fontWeight: 700,
                color: brandColor,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                mb: 0.5,
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: brandHover,
                },
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 18 }} />
              Platform
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#212529',
                mb: 0.5,
              }}
            >
              회원가입
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#868e96',
                mb: 4,
              }}
            >
              회원가입을 진행해주세요
            </Typography>

            {/* Form */}
            <Box sx={{ width: '100%', px: 2 }}>
              {/* Required section */}
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#495057',
                  letterSpacing: '0.5px',
                  mb: 2,
                }}
              >
                필수 정보
              </Typography>

              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  id="mail"
                  label="이메일"
                  name="mail"
                  autoComplete="email"
                  size="medium"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon
                          sx={{ color: '#adb5bd', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  {...register('mail')}
                />
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="비밀번호 (8자리 이상)"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  size="medium"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ color: '#adb5bd', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="비밀번호 표시 토글"
                          onClick={() => setShowPassword(prev => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff
                              sx={{ fontSize: 20, color: '#adb5bd' }}
                            />
                          ) : (
                            <Visibility
                              sx={{ fontSize: 20, color: '#adb5bd' }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password1')}
                />
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="비밀번호 확인"
                  type={showPassword2 ? 'text' : 'password'}
                  id="password2"
                  autoComplete="new-password"
                  size="medium"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ color: '#adb5bd', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="비밀번호 확인 표시 토글"
                          onClick={() => setShowPassword2(prev => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword2 ? (
                            <VisibilityOff
                              sx={{ fontSize: 20, color: '#adb5bd' }}
                            />
                          ) : (
                            <Visibility
                              sx={{ fontSize: 20, color: '#adb5bd' }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password2')}
                />
              </Stack>

              {/* Divider */}
              <Divider sx={{ my: 3, borderColor: '#e6eaed' }} />

              {/* Personal info section */}
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#495057',
                  letterSpacing: '0.5px',
                  mb: 0.5,
                }}
              >
                개인 정보
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#adb5bd',
                  mb: 2,
                }}
              >
                관리자 승인 시 필요합니다
              </Typography>

              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  autoComplete="name"
                  name="name"
                  id="name"
                  label="이름 (필수)"
                  size="medium"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon
                          sx={{ color: '#adb5bd', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  {...register('name')}
                />
                <TextField
                  fullWidth
                  id="phone"
                  label="핸드폰 번호 (선택)"
                  name="phone"
                  autoComplete="tel"
                  size="medium"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon
                          sx={{ color: '#adb5bd', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  {...register('phone')}
                />
              </Stack>

              {/* Primary action: Filled Tonal */}
              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                loading={isLoading}
                onClick={send}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: brandColor,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: brandHover,
                  },
                }}
              >
                회원가입
              </LoadingButton>

              {/* Info notice */}
              <Box
                sx={{
                  backgroundColor: '#F2F4F6',
                  borderRadius: '12px',
                  px: 2,
                  py: 1.5,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#868e96',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  회원가입 후 관리자 승인까지 시간이 걸립니다
                </Typography>
              </Box>

              {/* Secondary action: Text button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="text"
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: '#495057',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 178, 178, 0.06)',
                      color: brandColor,
                    },
                  }}
                  onClick={() => {
                    navigate('/login');
                  }}
                >
                  계정이 있으신가요? 로그인
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Copyright />
        </Box>
      </Container>
    </Box>
  );
};

export default Join;
