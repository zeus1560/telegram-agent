/* eslint-disable consistent-return */
import toast from 'react-hot-toast';

export const findMenuById = (menus, findMenuId) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].id === findMenuId) {
      return menus[i];
    }
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < menus[i].menus.length; j++) {
      if (menus[i].menus[j].id === findMenuId) {
        return menus[i].menus[j];
      }
    }
  }
};

export const showToastError = message => {
  toast.error(message, {
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  });
};

export function showError(error) {
  if (error.response) {
    showToastError(error.response.data.message);
  } else if (error.message) {
    showToastError(error.message);
  } else {
    showToastError('에러가 발생했습니다.');
  }
}

export const showToastErrorObject = error => {
  if (error.response) {
    showToastError(error.response.data.message);
  } else if (error.message) {
    showToastError(error.message);
  } else {
    showToastError(error);
  }
};

export const getfindBoard = (menuList, boardId) => {
  if (menuList) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < menuList.length; i++) {
      if (menuList[i].board_idx === boardId) {
        return menuList[i];
      }
      if (menuList[i].menu_type === 'category') {
        const find = getfindBoard(menuList[i].menu, boardId);
        if (find) {
          return find;
        }
      }
    }
  }
  return null;
};

export const getfindMenu = (menuList, menuId) => {
  if (menuList) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < menuList.length; i++) {
      if (menuList[i].menu_idx === menuId) {
        return menuList[i];
      }
      if (menuList[i].menu_type === 'category') {
        const find = getfindMenu(menuList[i].menu, menuId);
        if (find) {
          return find;
        }
      }
    }
  }
  return null;
};

export const findCategory = (menuList, menuId) => {
  if (menuList) {
    for (let i = 0; i < menuList.length; i += 1) {
      if (menuList[i].menu_idx === menuId) {
        return menuList[i];
      }
      if (menuList[i].menu_type === 'category') {
        const find = getfindMenu(menuList[i].menu, menuId);
        if (find) {
          return menuList[i];
        }
      }
    }
  }
  return null;
};

export const findRoot = (menuList, menuId) => {
  const menu = findCategory(menuList, menuId);
  if (menu) {
    if (menu.menu_depth === 2) return findCategory(menuList, menu.menu_idx);
    return menu;
  }
  return null;
};
