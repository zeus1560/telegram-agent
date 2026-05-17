import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import Root from './components/frame/Root';
import Home from './pages/Home';
import Login from './pages/Login';
import ScreenLoading from './components/common/ScreenLoading';
import { menuApi } from './api/global';
import { menuState } from './atoms';
import MenuRoot from './pages/MenuRoot';
import useUser from './hooks/useUser';
import BasicDetail from './pages/BasicDetail';
import Join from './pages/Join';

const commonPaths = [
  {
    path: '',
    element: <Home />,
  },
  { path: '/menu/:menuId', element: <MenuRoot /> },
  {
    path: '/menu/:menuId/board/basic/:id',
    element: <BasicDetail />,
  },
];

const logoutRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      ...commonPaths,
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/join',
    element: <Join />,
  },
]);

const loginRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      ...commonPaths,
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
]);

export default function Router() {
  const setMenu = useSetRecoilState(menuState);
  const [loading, setLoading] = useState(true);
  const { user, isLoading } = useUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await menuApi.list();
        setMenu(data);
      } catch (err) {
        // console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setMenu]);

  if (loading || isLoading) {
    return <ScreenLoading />;
  }

  if (user) {
    return <RouterProvider router={loginRouter} />;
  }

  return <RouterProvider router={logoutRouter} />;
}
