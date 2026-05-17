import { atom } from 'recoil';

export const menuState = atom({
  key: 'menu',
  default: [],
});

export const userState = atom({
  key: 'user',
  default: null,
});

export const detailState = atom({
  key: 'detailState',
  default: null,
});

export const currentMenuId = atom({
  key: 'currentMenuId',
  default: '',
});

