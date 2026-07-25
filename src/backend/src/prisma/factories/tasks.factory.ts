import { Faker } from '@faker-js/faker';
import { Prisma, Task_Priority, Task_Status } from '@prisma/client';
import { addDaysToDate } from 'shared';
import { DateRange } from '../context.js';
import { clampDate, daysBetween, DAY_MS } from '../dates.js';

export type SeedTaskParent = {
  wbsElementId: string;
  timeline: DateRange;
};

export type SeedTaskOverrides = Partial<Prisma.TaskCreateInput>;

const TASK_TITLE_VERBS = [
  'Design',
  'Review',
  'Validate',
  'Document',
  'Manufacture',
  'Test',
  'Research',
  'Update',
  'Finalize',
  'Debug',
  'Package',
  'Calculate',
  'Model',
  'Simulate',
  'Audit',
  'Schedule',
  'Create',
  'Refactor',
  'Implement'
];

const TASK_TITLE_OBJECTS = [
  'steering wheel design',
  'seat design',
  'CAN handler formatting',
  'object handling',
  'software and firmware Confluence file structure',
  'Calypso bidirectionality',
  'Scylla bidirectional function',
  'roll hoop positions',
  'side wall stand-ins',
  'seat angle',
  'neutral body position for headrest',
  'RTOS standard practices',
  'full car Simscape model',
  'quarter car Simscape model',
  'hub and knuckle design',
  'steering rack placement',
  'research review writeup',
  'optimal steering geometry simulations',
  'skidpad simulation',
  'bump steer mitigation calculations',
  'brake calculator',
  'suspension geometry design review',
  'front wing geometry',
  'rear wing geometry',
  'airfoil layup testing',
  'CFD car model',
  'front wing mounting',
  'rear wing mount FEA',
  'BMS schematic',
  'power tree design',
  'balancing resistor and capacitors',
  'IsoSPI filter design',
  'BMS connectors',
  'PCB layout',
  'first board population',
  'FSAE rules audit',
  'SES documentation',
  'design review documentation',
  'manufacturing plan',
  'material selection',
  'carbon fiber plate manufacturing procedure',
  'jigging setup',
  'PM plan',
  'GitHub build runner',
  'MQTT UI screen',
  'fault screen',
  'protobuf migration',
  'Slack message viewer',
  'recruitment UI'
];

const taskTitle = (faker: Faker): string => {
  if (faker.datatype.boolean({ probability: 0.7 })) {
    return faker.helpers.arrayElement(TASK_TITLE_OBJECTS);
  }

  return `${faker.helpers.arrayElement(TASK_TITLE_VERBS)} ${faker.helpers.arrayElement(TASK_TITLE_OBJECTS)}`;
};

const TASK_NOTES = [
  'Check packaging, manufacturability, load cases, and interfaces with nearby systems.',
  'Verify assumptions and document any follow-up decisions in Confluence.',
  'Confirm behavior locally, update documentation if needed, and make sure edge cases are covered.',
  'Document assumptions, inputs, outputs, and next design decisions from the analysis.',
  'Collect missing information, resolve open questions, and record action items for the project.',
  'Validate the design against relevant FSAE rules before marking this complete.',
  'Coordinate with the project lead before closing this out.',
  'Make sure the latest CAD, calculations, and review notes are reflected in FinishLine.',
  'Prepare this for design review and note any unresolved risks.',
  'Compare options for cost, strength, manufacturability, packaging, and lead time.',
  'Run the first pass, summarize results, and list what needs to change next.',
  'Clean up the documentation so future members can understand the decision.',
  'Check integration assumptions with the relevant mechanical, electrical, or software owner.',
  'Make sure this still matches the current project scope and timeline.'
];

const randomDateInRange = (faker: Faker, range: DateRange): Date => {
  const durationDays = daysBetween(range);

  return addDaysToDate(
    new Date(range.start),
    faker.number.int({
      min: 0,
      max: durationDays
    })
  );
};

const DUE_BUFFER_DAYS = 7;

/**
 * A task can only be created/marked DONE if none of its task-level blockers and none of its work
 * package's blocking work packages still have active (non-done) work - see getActiveTaskBlockerNames.
 * When `canBeDone` is false, DONE is redistributed to IN_PROGRESS so the seed never persists a task
 * that createTask/editTask would have rejected.
 */
const taskStatusForDueDate = (faker: Faker, dueDate: Date, now: Date = new Date(), canBeDone = true): Task_Status => {
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / DAY_MS);

  let status: Task_Status;

  if (daysUntilDue < -DUE_BUFFER_DAYS) {
    status = faker.helpers.weightedArrayElement([
      { weight: 80, value: Task_Status.DONE },
      { weight: 15, value: Task_Status.IN_PROGRESS },
      { weight: 5, value: Task_Status.IN_BACKLOG }
    ]);
  } else if (daysUntilDue > DUE_BUFFER_DAYS) {
    status = faker.helpers.weightedArrayElement([
      { weight: 75, value: Task_Status.IN_BACKLOG },
      { weight: 20, value: Task_Status.IN_PROGRESS },
      { weight: 5, value: Task_Status.DONE }
    ]);
  } else {
    status = faker.helpers.weightedArrayElement([
      { weight: 65, value: Task_Status.IN_PROGRESS },
      { weight: 20, value: Task_Status.DONE },
      { weight: 15, value: Task_Status.IN_BACKLOG }
    ]);
  }

  return !canBeDone && status === Task_Status.DONE ? Task_Status.IN_PROGRESS : status;
};

const randomPriority = (faker: Faker): Task_Priority =>
  faker.helpers.weightedArrayElement([
    { weight: 20, value: Task_Priority.LOW },
    { weight: 60, value: Task_Priority.MEDIUM },
    { weight: 20, value: Task_Priority.HIGH }
  ]);

export const taskCountForProject = (faker: Faker): number => {
  const bucket = faker.number.int({ min: 1, max: 100 });

  if (bucket <= 8) return 0;
  if (bucket <= 75) return faker.number.int({ min: 6, max: 24 });
  if (bucket <= 94) return faker.number.int({ min: 25, max: 50 });
  return faker.number.int({ min: 51, max: 80 });
};

export const assigneeCountForTask = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 70, value: 1 },
    { weight: 25, value: 2 },
    { weight: 5, value: 3 }
  ]);

const TASK_LABELS = [
  { name: 'Documentation', colorHexCode: '#EC4899' },
  { name: 'New-Member Task', colorHexCode: '#283593' },
  { name: 'Own', colorHexCode: '#283593' },
  { name: 'Assist', colorHexCode: '#283593' },
  { name: 'Observe', colorHexCode: '#283593' },
  { name: 'Quick & Easy', colorHexCode: '#66BB6A' },
  { name: 'Collaborative', colorHexCode: '#F0B429' },
  { name: 'Intense', colorHexCode: '#E5534B' }
];

export const taskLabelCreateInputs = (organizationId: string, userCreatedId: string): Prisma.Task_LabelCreateInput[] =>
  TASK_LABELS.map(({ name, colorHexCode }) => ({
    name,
    colorHexCode,
    organization: { connect: { organizationId } },
    userCreated: { connect: { userId: userCreatedId } }
  }));

export const labelCountForTask = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 55, value: 0 },
    { weight: 30, value: 1 },
    { weight: 12, value: 2 },
    { weight: 3, value: 3 }
  ]);

export const createSeedTask = (
  faker: Faker,
  parent: SeedTaskParent,
  creatorId: string,
  assigneeIds: string[],
  labelIds: string[] = [],
  canBeDone = true,
  overrides: SeedTaskOverrides = {}
): Prisma.TaskCreateInput => {
  const deadline = randomDateInRange(faker, parent.timeline);

  const startDate = faker.datatype.boolean({ probability: 0.7 })
    ? clampDate(addDaysToDate(deadline, -faker.number.int({ min: 1, max: 21 })), {
        start: parent.timeline.start,
        end: deadline
      })
    : undefined;

  const createdDateBase = startDate ?? deadline;
  const dateCreated = clampDate(addDaysToDate(createdDateBase, -faker.number.int({ min: 0, max: 14 })), {
    start: parent.timeline.start,
    end: createdDateBase
  });

  return {
    title: taskTitle(faker),
    notes: faker.helpers.arrayElement(TASK_NOTES),
    priority: randomPriority(faker),
    status: taskStatusForDueDate(faker, deadline, new Date(), canBeDone),
    startDate,
    deadline,
    dateCreated,
    createdBy: {
      connect: { userId: creatorId }
    },
    assignees: {
      connect: assigneeIds.map((userId) => ({ userId }))
    },
    labels: {
      connect: labelIds.map((taskLabelId) => ({ taskLabelId }))
    },
    wbsElement: {
      connect: { wbsElementId: parent.wbsElementId }
    },
    ...overrides
  };
};
