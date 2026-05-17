/* eslint-disable import/prefer-default-export */
import axiosInstance from './axiosInstance';

export const holyWeekApi = {
  list: year => axiosInstance.get(`/holy-week/admin?year=${year}`),
  add: info => axiosInstance.post('/holy-week', info),
  update: (id, info) => axiosInstance.put(`/holy-week/${id}`, info),
  detail: id => axiosInstance.get(`/holy-week/admin?year=2026`),
  delete: id => axiosInstance.delete(`/holy-week/${id}`),
};
