
import { Role } from '@prisma/client';

export const rankUserRole = (role: Role) => {
    switch (role) {
      case 'APP_ADMIN':
        return 5;
      case 'ADMIN':
        return 4;
      case 'LEADERSHIP':
        return 3;
      case 'MEMBER':
        return 2;
      default:
        return 1;
    }
  };
