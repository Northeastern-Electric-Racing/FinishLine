import { Faker } from '@faker-js/faker';
import { Prisma, WBS_Element_Status, Work_Package_Stage } from '@prisma/client';
import { DateRange } from '../context.js';
import { clampDate, DAYS_PER_WEEK, daysBetween } from '../dates.js';
import { addDaysToDate } from 'shared';

const WORK_PACKAGE_NULL_STAGE_CHANCE = 0.15;

const WP_NAMES_BY_STAGE: Record<Work_Package_Stage, string[]> = {
  [Work_Package_Stage.RESEARCH]: [
    'Research',
    'Analysis',
    'Investigation',
    'Literature Review',
    'Requirements Analysis',
    'Feasibility Study',
    'Market Research',
    'Benchmarking',
    'Trade Study',
    'Concept Exploration'
  ],
  [Work_Package_Stage.DESIGN]: [
    'Concept of Design',
    'CAD Modeling',
    'Detailed Design',
    'Design Review Prep',
    'Tolerance Analysis',
    'Schematic Design',
    'Layout Design',
    'Design Iteration',
    'System Architecture',
    'Interface Design'
  ],
  [Work_Package_Stage.MANUFACTURING]: [
    'Fabrication',
    'Manufacturing',
    'Machining',
    'Assembly',
    'Procurement',
    'Prototyping',
    'Build',
    'Production',
    'Part Ordering',
    'Component Manufacturing'
  ],
  [Work_Package_Stage.INSTALL]: [
    'Installation',
    'Integration',
    'Assembly',
    'Wiring',
    'Mounting',
    'System Integration',
    'Harness Routing',
    'Commissioning',
    'Fit Check',
    'Subsystem Integration'
  ],
  [Work_Package_Stage.TESTING]: [
    'Testing',
    'Validation',
    'Verification',
    'Sign Off',
    'Bench Testing',
    'System Testing',
    'Performance Testing',
    'Load Testing',
    'Acceptance Testing',
    'Final Review'
  ]
};

const WP_NAMES_NO_STAGE = [
  'Planning',
  'Documentation',
  'Review',
  'Kickoff',
  'Closeout',
  'Milestone',
  'Support',
  'Coordination'
];

export const generateWorkPackageName = (faker: Faker, projectName: string, stage: Work_Package_Stage | null): string => {
  const suffix = stage
    ? faker.helpers.arrayElement(WP_NAMES_BY_STAGE[stage])
    : faker.helpers.arrayElement(WP_NAMES_NO_STAGE);

  return `${projectName} ${suffix}`;
};

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

export const generateWorkPackageStage = (faker: Faker): Work_Package_Stage | null => {
  if (faker.datatype.boolean({ probability: WORK_PACKAGE_NULL_STAGE_CHANCE })) return null;
  return faker.helpers.arrayElement(Object.values(Work_Package_Stage).sort());
};

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

const getOverdueStatus = (faker: Faker, daysOverdue: number): WBS_Element_Status => {
  if (daysOverdue <= 0) return WBS_Element_Status.ACTIVE;

  // inverse exponential: starts at ~80% incomplete chance, drops rapidly toward 0
  const incompleteChance = 0.8 * Math.exp(-0.01 * daysOverdue);

  return faker.datatype.boolean({ probability: 1 - incompleteChance })
    ? WBS_Element_Status.COMPLETE
    : WBS_Element_Status.ACTIVE;
};

export const workPackageCreateInput = (
  faker: Faker,
  organizationId: string,
  carNumber: number,
  projectNumber: number,
  workPackageNumber: number,
  projectId: string,
  orderInProject: number,
  name: string,
  startDate: Date,
  duration: number,
  stage: Work_Package_Stage | null,
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
      status: getOverdueStatus(faker, daysBetween({ start: addDaysToDate(startDate, duration * 7), end: new Date() })),
      organization: { connect: { organizationId } },
      ...(leadId ? { lead: { connect: { userId: leadId } } } : {}),
      ...(managerId ? { manager: { connect: { userId: managerId } } } : {})
    }
  }
});
