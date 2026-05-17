import axiosInstance from './axiosInstance';

// eslint-disable-next-line import/prefer-default-export
export const userApi = {
  add: info => axiosInstance.post('/users', info),
  approve: id => axiosInstance.put(`/users/${id}/approve`),
};
