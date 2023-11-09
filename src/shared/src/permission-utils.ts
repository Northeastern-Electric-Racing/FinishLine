import { Role, RoleEnum } from 'shared';

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

export const isAtLeastRank = (atLeastRole: Role, currentRole?: Role) => {
  if (!currentRole) return false;
  return rankUserRole(currentRole) >= rankUserRole(atLeastRole);
};

const isAtMostRank = (atMostRole: Role, currentRole?: Role) => {
  if (!currentRole) return true;
  return rankUserRole(currentRole) <= rankUserRole(atMostRole);
};

export const isAdmin = (role?: Role) => {
  return isAtLeastRank(RoleEnum.ADMIN, role);
};

export const isHead = (role?: Role) => {
  return isAtLeastRank(RoleEnum.HEAD, role);
};

export const isLeadership = (role?: Role) => {
  return isAtLeastRank(RoleEnum.LEADERSHIP, role);
};

export const isNotLeadership = (role?: Role) => {
  return isAtMostRank(RoleEnum.MEMBER, role);
};

export const isGuest = (role?: Role) => {
  if (!role) return true;
  return role === RoleEnum.GUEST;
};
