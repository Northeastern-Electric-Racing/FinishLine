import { Prisma } from '@prisma/client';

export type BaseWbsElementQueryArgs = ReturnType<typeof getBaseWbsElementQueryArgs>;
export type BaseProjectQueryArgs = ReturnType<typeof getBaseProjectQueryArgs>;
export type BaseWorkPackageQueryArgs = ReturnType<typeof getBaseWorkPackageQueryArgs>;

// The project and work package bases live here, not in their domain files, because other domains' query args nest
// them (e.g. teams), and projects.query-args.ts imports those domains back. Like user.query-args.ts, keep this file
// free of other query args imports to avoid circular dependencies.

// the wbs element columns every project and work package carries; lead and manager are ids only, so models that
// display them nest getBaseUserQueryArgs themselves. No wbsElementId (the project or work package row already has it)
// and no status (a project's is computed from its work packages, so only the work package base selects it)
export const getBaseWbsElementQueryArgs = () =>
  Prisma.validator<Prisma.WBS_ElementDefaultArgs>()({
    select: {
      carNumber: true,
      projectNumber: true,
      workPackageNumber: true,
      name: true,
      dateCreated: true,
      dateDeleted: true,
      leadId: true,
      managerId: true
    }
  });

// the minimum every consumer of a project needs
export const getBaseProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      projectId: true,
      wbsElementId: true,
      budget: true,
      summary: true,
      abbreviation: true,
      carId: true,
      // a project is meaningless without its wbs element (number, name)
      wbsElement: getBaseWbsElementQueryArgs()
    }
  });

// the minimum every consumer of a work package needs
export const getBaseWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      wbsElementId: true,
      projectId: true,
      orderInProject: true,
      startDate: true,
      duration: true,
      stage: true,
      // a work package is meaningless without its wbs element (number, name, status)
      wbsElement: { select: { ...getBaseWbsElementQueryArgs().select, status: true } }
    }
  });
