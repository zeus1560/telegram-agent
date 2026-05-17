import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';
import Copyright from '../../components/common/Copyright';
import { authApi } from '../../api/global';
import { LocalSave } from '../../LocalSave';

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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const { data: resData } = await authApi.login(
        data.get('mail'),
        data.get('password'),
      );
      LocalSave.setToken(resData.token);
      navigate(0);
    } catch (err) {
      alert(err?.response?.data?.message);
    }
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
                mb: 1,
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
                mb: 1,
              }}
            >
              로그인
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#868e96',
                mb: 5,
              }}
            >
              계정으로 로그인하세요
            </Typography>

            {/* Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: '100%', px: 2 }}
            >
              <TextField
                required
                fullWidth
                id="mail"
                label="이메일"
                name="mail"
                autoComplete="email"
                autoFocus
                size="medium"
                sx={{ ...textFieldSx, mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon
                        sx={{ color: '#adb5bd', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
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
                          <Visibility sx={{ fontSize: 20, color: '#adb5bd' }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Primary action: Filled Tonal */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                sx={{
                  mt: 4,
                  mb: 1.5,
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
                로그인
              </Button>

              {/* Secondary action: Text button */}
              <Button
                fullWidth
                variant="text"
                sx={{
                  py: 1.5,
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
                  navigate('/join');
                }}
              >
                계정이 없으신가요? 회원가입
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Copyright />
        </Box>
      </Container>
    </Box>
  );
}
