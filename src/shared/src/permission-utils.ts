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

const isAtLeastRank = (atLeastRole: Role, currentRole?: Role) => {
  if (!currentRole) return false;
  return rankUserRole(currentRole) >= rankUserRole(atLeastRole);
};

const isAtMostRank = (atMostRole: Role, currentRole?: Role) => {
  if (!currentRole) return true;
  return rankUserRole(currentRole) <= rankUserRole(atMostRole);
};

export const isAdmin: PermissionCheck = (role?: Role) => {
  return isAtLeastRank(RoleEnum.ADMIN, role);
};

export const isHead: PermissionCheck = (role?: Role) => {
  return isAtLeastRank(RoleEnum.HEAD, role);
};

export const isLeadership: PermissionCheck = (role?: Role) => {
  return isAtLeastRank(RoleEnum.LEADERSHIP, role);
};

export const isNotLeadership: PermissionCheck = (role?: Role) => {
  return isAtMostRank(RoleEnum.MEMBER, role);
};

export const isGuest: PermissionCheck = (role?: Role) => {
  if (!role) return true;
  return role === RoleEnum.GUEST;
};

export type PermissionCheck = (role: Role | undefined) => boolean;
