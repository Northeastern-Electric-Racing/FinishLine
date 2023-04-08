import { isGuest } from 'shared';
import prisma from '../prisma/prisma';

export const hasRiskPermissions = async (userId: number, projectId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) return false;

  if (!isGuest(user.role)) {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { projectId },
    include: { wbsElement: true }
  });

  if (!project) return false;

  if (project.wbsElement.projectLeadId === user.userId || project.wbsElement.projectManagerId === user.userId) {
    return true;
  }

  return false;
};
