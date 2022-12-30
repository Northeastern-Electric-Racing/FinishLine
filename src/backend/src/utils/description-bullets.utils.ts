import prisma from '../prisma/prisma';
import { Role } from '@prisma/client';

export const hasBulletCheckingPermissions = async (userId: number, descriptionId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  const descriptionBullet = await prisma.description_Bullet.findUnique({
    where: { descriptionId },
    include: {
      workPackageDeliverables: { include: { wbsElement: { include: { projectLead: true, projectManager: true } } } },
      workPackageExpectedActivities: { include: { wbsElement: { include: { projectLead: true, projectManager: true } } } }
    }
  });

  if (!descriptionBullet) return false;

  if (!user) return false;

  const leader =
    descriptionBullet.workPackageDeliverables?.wbsElement.projectLead ||
    descriptionBullet.workPackageExpectedActivities?.wbsElement.projectLead;
  const manager =
    descriptionBullet.workPackageDeliverables?.wbsElement.projectManager ||
    descriptionBullet.workPackageExpectedActivities?.wbsElement.projectManager;

  if (
    user.role === Role.APP_ADMIN ||
    user.role === Role.ADMIN ||
    user.role === Role.LEADERSHIP ||
    (leader && leader.userId === user.userId) ||
    (manager && manager.userId === user.userId)
  ) {
    return true;
  }
  return false;
};
