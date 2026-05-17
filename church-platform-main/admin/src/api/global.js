import { LocalSave } from '../LocalSave';
import axiosInstance from './axiosInstance';

export const authApi = {
  login: (mail, password) => axiosInstance.post('login', { mail, password }),
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
  update: (id, info) => axiosInstance.put(`menu/${id}`, info),
  get: id => axiosInstance.get(`menu/${id}`),
  delete: id => axiosInstance.delete(`menu/${id}`),
};

export const fileApi = {
  addImage: formData =>
    axiosInstance.post('files/images', formData, {
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    }),
  addFile: formData =>
    axiosInstance.post('files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const dailyApi = {
  list: () => axiosInstance.get('daily'),
  add: info => axiosInstance.post('daily', info),
  update: (id, info) => axiosInstance.post(`daily/${id}`, info),
  delete: id => axiosInstance.get(`daily/${id}`),
};
