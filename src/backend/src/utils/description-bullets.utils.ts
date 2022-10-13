import prisma from '../prisma/prisma';
import { Prisma, Role } from '@prisma/client';

export const descBulletArgs = Prisma.validator<Prisma.Description_BulletArgs>()({
  include: { userChecked: true }
});

export const descBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<typeof descBulletArgs>
) => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    userChecked: descBullet.userChecked ?? undefined
  };
};

export const hasBulletCheckingPermissions = async (userId: number, descriptionId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  const descriptionBullet = await prisma.description_Bullet.findUnique({
    where: { descriptionId }
  });

  if (!descriptionBullet) return false;

  if (!user) return false;

  if (user.role === Role.APP_ADMIN || user.role === Role.ADMIN || user.role === Role.LEADERSHIP) {
    return true;
  }
  return false;
};
