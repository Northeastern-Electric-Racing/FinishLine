import prisma from '../prisma/prisma';
import { Role } from '@prisma/client';

export const hasBulletCheckingPermissions = async (userId: number, descriptionId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) return false;

  if (user.role === Role.APP_ADMIN || user.role === Role.ADMIN || user.role === Role.LEADERSHIP) {
    return true;
  }

  const descriptionBullet = await prisma.description_Bullet.findUnique({
    where: { descriptionId }
  });

  if (!descriptionBullet) return false;

  if (descriptionBullet.userCheckedId === user.userId) {
    return true;
  }

  return false;
};
