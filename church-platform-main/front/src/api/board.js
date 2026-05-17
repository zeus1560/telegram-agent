/* eslint-disable import/prefer-default-export */
import axiosInstance from './axiosInstance';

export const boardApi = {
  basicDetail: (menuId, id) =>
    axiosInstance.get(`/board/menu/${menuId}/basic/${id}`),
};

export const commentApi = {
  list: (menuId, boardId, params) =>
    axiosInstance.get(`/board/menu/${menuId}/basic/${boardId}/comment`, {
      params,
    }),
  create: (menuId, boardId, info) =>
    axiosInstance.post(`/board/menu/${menuId}/basic/${boardId}/comment`, info),
  update: (menuId, boardId, commentId, info) =>
    axiosInstance.put(
      `/board/menu/${menuId}/basic/${boardId}/comment/${commentId}`,
      info,
    ),
  delete: (menuId, boardId, commentId) =>
    axiosInstance.delete(
      `/board/menu/${menuId}/basic/${boardId}/comment/${commentId}`,
    ),
};

