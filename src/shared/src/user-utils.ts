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

const isAtLeastRank = (role: Role, rank: number) => {
  return rankUserRole(role) >= rank;
};

const isAtMostRank = (role: Role, rank: number) => {
  return rankUserRole(role) <= rank;
};

export const isAdmin = (role: Role) => {
  return isAtLeastRank(role, 5);
};

export const isHead = (role: Role) => {
  return isAtLeastRank(role, 4);
};

export const isLeadership = (role: Role) => {
  return isAtLeastRank(role, 3);
};

export const isNotLeadership = (role: Role) => {
  return isAtMostRank(role, 2);
};

export const isGuest = (role: Role) => {
  return role === 'GUEST';
};
