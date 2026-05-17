import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import Root from './components/frame/Root';
import User from './pages/User';
import ManageMenu from './pages/ManageMenu';
import MenuRoot from './pages/MenuRoot';
import Login from './pages/Login';
import useUser from './hooks/useUser';
import Loading from './components/common/Loading';

const LoggedInRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'manage-menu',
        element: <ManageMenu />,
      },
      {
        path: 'user',
        element: <User />,
      },
      {
        path: 'menu/:id',
        element: <MenuRoot />,
      },
      {
        path: '*',
        element: <Navigate to="/user" />,
      },
    ],
  },
]);

const LogoutRouter = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <Navigate to="/login" />,
  },
]);

export default function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <RouterProvider router={LogoutRouter} />;
  }

  return <RouterProvider router={LoggedInRouter} />;
}
