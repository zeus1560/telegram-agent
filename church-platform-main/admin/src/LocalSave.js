// eslint-disable-next-line import/prefer-default-export
export const LocalSave = {
  getToken: () => localStorage.getItem('platform-token'),
  setToken: token => {
    localStorage.setItem('platform-token', token);
  },
};
