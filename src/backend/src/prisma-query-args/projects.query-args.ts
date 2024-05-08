import { Prisma } from '@prisma/client';
import taskQueryArgs from './tasks.query-args';
import linkQueryArgs from './links.query-args';
import { assemblyQueryArgs, materialQueryArgs } from './bom.query-args';

const projectQueryArgs = Prisma.validator<Prisma.ProjectArgs>()({
  include: {
    wbsElement: {
      include: {
        lead: true,
        manager: true,
        tasks: { where: { dateDeleted: null }, ...taskQueryArgs },
        links: { ...linkQueryArgs },
        changes: { where: { changeRequest: { dateDeleted: null } }, include: { implementer: true } },
        materials: {
          where: { dateDeleted: null },
          ...materialQueryArgs
        },
        assemblies: {
          where: { dateDeleted: null },
          ...assemblyQueryArgs
        }
      }
    },
    teams: { include: { members: true, head: true, leads: true, teamType: true } },
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
            lead: true,
            manager: true,
            links: { ...linkQueryArgs },
            changes: { where: { changeRequest: { dateDeleted: null } }, include: { implementer: true } },
            materials: {
              ...materialQueryArgs
            },
            assemblies: {
              ...assemblyQueryArgs
            }
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
