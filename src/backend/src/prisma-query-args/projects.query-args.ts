import { Prisma } from '@prisma/client';
import taskQueryArgs from './tasks.query-args';

const projectQueryArgs = Prisma.validator<Prisma.ProjectArgs>()({
  include: {
    wbsElement: {
      include: {
        projectLead: true,
        projectManager: true,
        tasks: { where: { dateDeleted: null }, ...taskQueryArgs },
        changes: { where: { changeRequest: { dateDeleted: null } }, include: { implementer: true } }
      }
    },
    team: { include: { members: true, head: true } },
    goals: { where: { dateDeleted: null } },
    features: { where: { dateDeleted: null } },
    otherConstraints: { where: { dateDeleted: null } },
    workPackages: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        wbsElement: {
          include: {
            projectLead: true,
            projectManager: true,
            changes: { where: { changeRequest: { dateDeleted: null } }, include: { implementer: true } }
          }
        },
        blockedBy: { where: { dateDeleted: null } },
        expectedActivities: { where: { dateDeleted: null } },
        deliverables: { where: { dateDeleted: null } }
      }
    },
    favoritedBy: true
  }
});

export default projectQueryArgs;
