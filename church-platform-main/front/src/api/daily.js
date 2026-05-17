/* eslint-disable import/prefer-default-export */
import axiosInstance from './axiosInstance';

export const dailyApi = {
  getDay(day) {
    return axiosInstance.get(`/daily/date?day=${day}`);
  },
};
