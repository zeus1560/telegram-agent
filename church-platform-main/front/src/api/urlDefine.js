export const MenuUrl = {
  list: 'menu',
};

export const UserUrl = {
  list: 'users',
};

export const BoardUrl = {
  basicList: menuId => `board/menu/${menuId}/basic/front`,
  detail: id => `board/basic${id}`,
};
