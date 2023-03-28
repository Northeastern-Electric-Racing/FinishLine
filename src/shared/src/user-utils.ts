import { Role } from 'shared';

export const rankUserRole = (role: Role) => {
  switch (role) {
    case 'APP_ADMIN':
      return 6;
    case 'ADMIN':
      return 5;
    case 'HEAD':
      return 4;
    case 'LEADERSHIP':
      return 3;
    case 'MEMBER':
      return 2;
    default:
      return 1;
  }
};

export const isAdmin = (role: Role) => {
  return role === 'APP_ADMIN' || role === 'ADMIN';
};

export const isHead = (role: Role) => {
  return isAdmin(role) || role === 'HEAD';
};

export const isLeadership = (role: Role) => {
  return isHead(role) || role === 'LEADERSHIP';
};

export const isNotLeadership = (role: Role) => {
  return role === 'MEMBER' || role === 'GUEST';
};

export const isGuest = (role: Role) => {
  return role === 'GUEST';
};
