/* eslint-disable import/prefer-default-export */
import axiosInstance from './axiosInstance';

export const boardApi = {
  basicAdd: (menuId, info) =>
    axiosInstance.post(`/board/menu/${menuId}/basic`, info, {
      headers: {
        'Content-Type': `application/json`,
      },
    }),
  addImage: (menuId, info) =>
    axiosInstance.post(`/board/menu/${menuId}/basic/images`, info, {
      headers: {
        'Content-Type': `application/json`,
      },
    }),
  update: (menuId, boardId, info) =>
    axiosInstance.put(`/board/menu/${menuId}/basic/${boardId}`, info, {
      headers: {
        'Content-Type': `application/json`,
      },
    }).then((res) => console.log('수정 성공')).catch((err) => console.log('수정 실패'))
  detail: (menuId, boardId) =>
    axiosInstance.get(`/board/menu/${menuId}/basic/${boardId}`),
  delete: (menuId, boardId) =>
    axiosInstance.delete(`/board/menu/${menuId}/basic/${boardId}`),
};

