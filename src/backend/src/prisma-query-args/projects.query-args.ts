import { Prisma } from '@prisma/client';
import riskQueryArgs from './risks.query-args';

const projectQueryArgs = Prisma.validator<Prisma.ProjectArgs>()({
  include: {
    wbsElement: {
      include: {
        projectLead: true,
        projectManager: true,
        changes: { where: { changeRequest: { dateDeleted: null } }, include: { implementer: true } }
      }
    },
    team: true,
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
        dependencies: true,
        expectedActivities: true,
        deliverables: true
      }
    }
  }
});

export default projectQueryArgs;
