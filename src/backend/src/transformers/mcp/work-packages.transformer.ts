import { Prisma } from '@prisma/client';
import { calculateEndDate, McpDescriptionBulletGroup, McpWorkPackage, wbsPipe } from 'shared';
import { McpWorkPackageQueryArgs } from '../../prisma-query-args/mcp/work-packages.query-args.js';
import { wbsNumOf } from '../../utils/utils.js';
import { wbsElementUrl } from '../../utils/urls.utils.js';
import { fullName } from './shared.js';

/**
 * Groups description bullets by their type name, preserving whatever types the organization has
 * configured. Deliverables and expected activities are just two of those names, so grouping
 * generically avoids hardcoding strings that an organization is free to rename.
 */
const groupDescriptionBullets = (
  bullets: { detail: string; descriptionBulletType: { name: string } }[]
): McpDescriptionBulletGroup[] => {
  const groups = new Map<string, string[]>();

  bullets.forEach((bullet) => {
    const typeName = bullet.descriptionBulletType.name;
    const details = groups.get(typeName) ?? [];
    details.push(bullet.detail);
    groups.set(typeName, details);
  });

  return [...groups.entries()].map(([type, details]) => ({ type, details }));
};

export const mcpWorkPackageTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<McpWorkPackageQueryArgs>
): McpWorkPackage => {
  const wbsNum = wbsPipe(wbsNumOf(workPackage.wbsElement));

  return {
    wbsNum,
    name: workPackage.wbsElement.name,
    status: workPackage.wbsElement.status,
    stage: workPackage.stage ?? undefined,
    startDate: workPackage.startDate,
    // there is no end date column, it is the start date plus the duration in weeks
    endDate: calculateEndDate(workPackage.startDate, workPackage.duration),
    durationWeeks: workPackage.duration,
    lead: fullName(workPackage.wbsElement.lead),
    manager: fullName(workPackage.wbsElement.manager),
    descriptionBullets: groupDescriptionBullets(workPackage.wbsElement.descriptionBullets),
    blockedBy: workPackage.blockedBy.map((blocker) => wbsPipe(wbsNumOf(blocker))),
    viewOnFinishline: wbsElementUrl(wbsNum)
  };
};
