// eslint-disable-next-line import/prefer-default-export
export const LocalSave = {
  getToken: () => localStorage.getItem('platform-front-token'),
  setToken: token => {
    localStorage.setItem('platform-front-token', token);
  },
};
