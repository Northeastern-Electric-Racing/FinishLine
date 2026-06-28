import { Faker } from '@faker-js/faker';
import { Prisma, Task_Priority, Task_Status } from '@prisma/client';
import dayjs from 'dayjs';
import { DateRange } from '../context.js';

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

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const clampDate = (date: Date, min: Date, max: Date): Date => {
  if (date < min) return new Date(min);
  if (date > max) return new Date(max);
  return date;
};

const daysBetween = ({ start, end }: DateRange): number => Math.max(0, dayjs(end).diff(dayjs(start), 'day'));

const randomDateInRange = (faker: Faker, range: DateRange): Date => {
  const durationDays = daysBetween(range);

  return addDays(
    new Date(range.start),
    faker.number.int({
      min: 0,
      max: durationDays
    })
  );
};

const taskStatusForDueDate = (faker: Faker, dueDate: Date, timeline: DateRange): Task_Status => {
  const totalDays = Math.max(1, daysBetween(timeline));
  const daysFromStart = dayjs(dueDate).diff(dayjs(timeline.start), 'day');
  const timelineProgress = daysFromStart / totalDays;

  if (timelineProgress < 0.4) {
    return faker.helpers.weightedArrayElement([
      { weight: 80, value: Task_Status.DONE },
      { weight: 15, value: Task_Status.IN_PROGRESS },
      { weight: 5, value: Task_Status.IN_BACKLOG }
    ]);
  }

  if (timelineProgress > 0.65) {
    return faker.helpers.weightedArrayElement([
      { weight: 75, value: Task_Status.IN_BACKLOG },
      { weight: 20, value: Task_Status.IN_PROGRESS },
      { weight: 5, value: Task_Status.DONE }
    ]);
  }

  return faker.helpers.weightedArrayElement([
    { weight: 65, value: Task_Status.IN_PROGRESS },
    { weight: 20, value: Task_Status.DONE },
    { weight: 15, value: Task_Status.IN_BACKLOG }
  ]);
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

export const createSeedTask = (
  faker: Faker,
  parent: SeedTaskParent,
  creatorId: string,
  assigneeIds: string[],
  overrides: SeedTaskOverrides = {}
): Prisma.TaskCreateInput => {
  const deadline = randomDateInRange(faker, parent.timeline);

  const startDate = faker.datatype.boolean({ probability: 0.7 })
    ? clampDate(addDays(deadline, -faker.number.int({ min: 1, max: 21 })), new Date(parent.timeline.start), deadline)
    : undefined;

  const createdDateBase = startDate ?? deadline;
  const dateCreated = clampDate(
    addDays(createdDateBase, -faker.number.int({ min: 0, max: 14 })),
    new Date(parent.timeline.start),
    createdDateBase
  );

  return {
    title: `${faker.helpers.arrayElement(TASK_TITLE_VERBS)} ${faker.helpers.arrayElement(TASK_TITLE_OBJECTS)}`,
    notes: faker.helpers.arrayElement(TASK_NOTES),
    priority: randomPriority(faker),
    status: taskStatusForDueDate(faker, deadline, parent.timeline),
    startDate,
    deadline,
    dateCreated,
    createdBy: {
      connect: { userId: creatorId }
    },
    assignees: {
      connect: assigneeIds.map((userId) => ({ userId }))
    },
    wbsElement: {
      connect: { wbsElementId: parent.wbsElementId }
    },
    ...overrides
  };
};
