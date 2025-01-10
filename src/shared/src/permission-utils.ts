import { Permission, Role, RoleEnum } from 'shared';

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

export const isMember: PermissionCheck = (role?: Role) => {
  if (!role) return true;
  return role === RoleEnum.MEMBER;
};

export const isLead: PermissionCheck = (role?: Role) => {
  if (!role) return true;
  return role === RoleEnum.HEAD || role === RoleEnum.LEADERSHIP;
};

export type PermissionCheck = (role: Role | undefined) => boolean;

const GUEST_PERMISSIONS = [] as Permission[];

const MEMBER_PERMISSIONS = GUEST_PERMISSIONS.concat([
  Permission.EDIT_GRAPH,
  Permission.CREATE_GRAPH,
  Permission.VIEW_GRAPH,
  Permission.DELETE_GRAPH,
  Permission.VIEW_GRAPH_COLLECTION,
  Permission.EDIT_GRAPH_COLLECTION,
  Permission.CREATE_GRAPH_COLLECTION,
  Permission.DELETE_GRAPH_COLLECTION
]);

const LEADERSHIP_PERMISSIONS = MEMBER_PERMISSIONS.concat([]);

const HEAD_PERMISSIONS = LEADERSHIP_PERMISSIONS.concat([]);

const ADMIN_PERMISSIONS = HEAD_PERMISSIONS.concat([]);

const APP_ADMIN_PERMISSIONS = ADMIN_PERMISSIONS.concat([]);

export const getPermissionsForRoleType = (role: Role): Permission[] => {
  switch (role) {
    case RoleEnum.APP_ADMIN:
      return APP_ADMIN_PERMISSIONS;
    case RoleEnum.ADMIN:
      return ADMIN_PERMISSIONS;
    case RoleEnum.HEAD:
      return HEAD_PERMISSIONS;
    case RoleEnum.LEADERSHIP:
      return LEADERSHIP_PERMISSIONS;
    case RoleEnum.MEMBER:
      return MEMBER_PERMISSIONS;
    case RoleEnum.GUEST:
      return GUEST_PERMISSIONS;
  }

  return [];
};
