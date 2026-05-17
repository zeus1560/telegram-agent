/* eslint-disable import/prefer-default-export */
import axiosInstance from './axiosInstance';

export const boardApi = {
  basicAdd: (menuId, info) =>
    axiosInstance.post(`/board/menu/${menuId}/basic`, info, {
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    }),
  addImage: (menuId, info) =>
    axiosInstance.post(`/board/menu/${menuId}/basic/images`, info, {
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    }),
  update: (menuId, boardId, info) =>
    axiosInstance.put(`/board/menu/${menuId}/basic/${boardId}`, info, {
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    }),
  detail: (menuId, boardId) =>
    axiosInstance.get(`/board/menu/${menuId}/basic/${boardId}`),
  delete: (menuId, boardId) =>
    axiosInstance.delete(`/board/menu/${menuId}/basic/${boardId}`),
};

