import { LocalSave } from '../LocalSave';
import axiosInstance from './axiosInstance';

export const authApi = {
  login: (mail, password) => axiosInstance.post('login', { mail, password }),
  join: info => axiosInstance.post('join', info),
  adminLogin: (mail, password) =>
    axiosInstance.post('login/admin', { mail, password }),
  logout: () => {
    axiosInstance.post('logout');
    LocalSave.setToken('');
    axiosInstance.defaults.headers.common.Authorization = '';
  },
  setToken: token => {
    axiosInstance.defaults.headers.common.Authorization = token;
  },
};

export const menuApi = {
  list: () => axiosInstance.get('menu'),
  add: info => axiosInstance.post('menu', info),
  update: (id, info) => axiosInstance.post(`menu/${id}`, info),
  get: id => axiosInstance.get(`menu/${id}`),
  delete: id => axiosInstance.get(`menu/${id}`),
};

export const fileApi = {
  addImage: formData =>
    axiosInstance.post('files/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
