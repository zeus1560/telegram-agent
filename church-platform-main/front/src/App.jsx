import React from 'react';
import { CssBaseline } from '@mui/material';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvierContainer from './components/ThemeProvierContainer';
import './assets/scss/styles.scss';
import Router from './Router';
import 'moment/locale/ko';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      useErrorBoundary: true,
    },
    mutations: {
      useErrorBoundary: true,
    },
  },
});

function App() {
  return (
    <ThemeProvierContainer>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <Router />
        </RecoilRoot>
      </QueryClientProvider>
    </ThemeProvierContainer>
  );
}

export default App;
