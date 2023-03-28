import prisma from '../prisma/prisma';
import { isLeadership } from 'shared';

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

  if (isLeadership(user.role) || (leader && leader.userId === user.userId) || (manager && manager.userId === user.userId)) {
    return true;
  }
  return false;
};
