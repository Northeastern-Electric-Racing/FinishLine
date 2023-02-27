import { Prisma } from '@prisma/client';
import riskQueryArgs from './risks.query-args';
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
    team: { include: { members: true, leader: true } },
    goals: { where: { dateDeleted: null } },
    features: { where: { dateDeleted: null } },
    otherConstraints: { where: { dateDeleted: null } },
    risks: { where: { dateDeleted: null }, ...riskQueryArgs },
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
        dependencies: { where: { dateDeleted: null } },
        expectedActivities: { where: { dateDeleted: null } },
        deliverables: { where: { dateDeleted: null } }
      }
    }
  }
});

export default projectQueryArgs;
