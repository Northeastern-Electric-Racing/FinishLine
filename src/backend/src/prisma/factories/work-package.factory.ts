import { Faker } from '@faker-js/faker';
import { Prisma, WBS_Element_Status, Work_Package_Stage } from '@prisma/client';
import { DateRange } from '../context.js';
import { clampDate, DAYS_PER_WEEK, daysBetween } from '../dates.js';
import { addDaysToDate } from 'shared';

export const generateWorkPackageCount = (faker: Faker): number =>
  // Each project gets 0–8 work packages. Average work package count is around 5.
  faker.helpers.weightedArrayElement([
    { weight: 3, value: 0 },
    { weight: 5, value: 1 },
    { weight: 8, value: 2 },
    { weight: 14, value: 3 },
    { weight: 18, value: 4 },
    { weight: 22, value: 5 },
    { weight: 16, value: 6 },
    { weight: 9, value: 7 },
    { weight: 5, value: 8 }
  ]);

export const generateWorkPackageStage = (faker: Faker): Work_Package_Stage =>
  faker.helpers.arrayElement(Object.values(Work_Package_Stage));

export const generateWorkPackageTimeline = (faker: Faker, projectTimeline: DateRange, blockerEndDate?: Date): DateRange => {
  const start =
    blockerEndDate && blockerEndDate < projectTimeline.end
      ? addDaysToDate(blockerEndDate, 1)
      : addDaysToDate(
          projectTimeline.start,
          faker.number.int({
            min: 0,
            max: Math.max(0, daysBetween(projectTimeline) - DAYS_PER_WEEK)
          })
        );

  // duration saved in WEEKS instead of days
  const maxDuration = Math.floor(Math.max(1, daysBetween({ start, end: projectTimeline.end }) / DAYS_PER_WEEK));
  const duration = faker.number.int({ min: 1, max: Math.min(12, maxDuration) });

  return { start, end: clampDate(addDaysToDate(start, duration * DAYS_PER_WEEK), { start, end: projectTimeline.end }) };
};

export const workPackageCreateInput = (
  organizationId: string,
  carNumber: number,
  projectNumber: number,
  workPackageNumber: number,
  projectId: string,
  orderInProject: number,
  name: string,
  startDate: Date,
  duration: number,
  stage: Work_Package_Stage,
  leadId?: string,
  managerId?: string,
  blockedByWbsElementIds: string[] = []
): Prisma.Work_PackageCreateInput => ({
  orderInProject,
  startDate,
  duration,
  stage,
  project: { connect: { projectId } },
  ...(blockedByWbsElementIds.length > 0
    ? {
        blockedBy: {
          connect: blockedByWbsElementIds.map((wbsElementId) => ({ wbsElementId }))
        }
      }
    : {}),
  wbsElement: {
    create: {
      name,
      carNumber,
      projectNumber,
      workPackageNumber,
      status: WBS_Element_Status.ACTIVE,
      organization: { connect: { organizationId } },
      ...(leadId ? { lead: { connect: { userId: leadId } } } : {}),
      ...(managerId ? { manager: { connect: { userId: managerId } } } : {})
    }
  }
});
