/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Faker } from '@faker-js/faker';
import { Graph_Display_Type, Graph_Type, Measure, Prisma, Special_Permission } from '@prisma/client';
import { DateRange } from '../context.js';
import { generateRandomDate } from '../dates.js';

export type GraphActor = { userId: string };
export type GraphCarRef = { carId: string; dateRange: DateRange };

const GRAPH_COLLECTION_TITLES = [
  'Finance Graphics',
  'PM Plan Graphs',
  'Vehicle Dynamics',
  'Structural System Spending',
  'Ergo Spending',
  'Finance Collection',
  'Budget Overview',
  'Reimbursement Tracking',
  'Change Request Trends',
  'Powertrain Spending',
  'Aero Budget',
  'Season Summary',
  'Executive Dashboard',
  'Team Spending Breakdown',
  'Division Budget Report',
  'Quarterly Finance Review',
  'Project Health',
  'Competition Budget',
  'Sponsorship Impact',
  'Cost Analysis',
  'Spending by Team',
  'Annual Review'
];

const GRAPH_TITLE_BY_TYPE: Record<Graph_Type, string> = {
  [Graph_Type.PROJECT_BUDGET_BY_PROJECT]: 'Project Budget by Project',
  [Graph_Type.PROJECT_BUDGET_BY_TEAM]: 'Project Budget by Team',
  [Graph_Type.PROJECT_BUDGET_BY_DIVISION]: 'Project Budget by Division',
  [Graph_Type.CHANGE_REQUESTS_BY_PROJECT]: 'Change Requests by Project',
  [Graph_Type.CHANGE_REQUESTS_BY_TEAM]: 'Change Requests by Team',
  [Graph_Type.CHANGE_REQUESTS_BY_DIVISION]: 'Change Requests by Division',
  [Graph_Type.REIMBURSEMENT_TOTAL_BY_PROJECT]: 'Reimbursement Total by Project',
  [Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM]: 'Reimbursement Total by Team',
  [Graph_Type.REIMBURSEMENT_TOTAL_BY_DIVISION]: 'Reimbursement Total by Division',
  [Graph_Type.CHANGE_REQUESTS_BY_STATUS]: 'Change Requests by Status',
  [Graph_Type.PROJECT_BUDGET_VS_REIMBURSED_AMOUNT]: 'Project Budget vs Reimbursed Amount',
  [Graph_Type.ATTENDANCE_BY_TEAM]: 'Attendance by Team',
  [Graph_Type.ATTENDANCE_BY_DIVISION]: 'Attendance by Division'
};

export type GraphCollectionPlan = {
  title: string;
  viewPermissions: Special_Permission[];
  creatorId: string;
  dateCreated: Date;
  dateDeleted?: Date;
  deleterId?: string;
};

export type GraphPlan = {
  title: string;
  graphType: Graph_Type;
  displayGraphType: Graph_Display_Type;
  measure: Measure;
  specialPermissions: Special_Permission[];
  creatorId: string;
  dateCreated: Date;
  startDate?: Date;
  endDate?: Date;
  carIds: string[];
  collectionIndex?: number;
};

export const graphCollectionCountForOrg = (faker: Faker): number => faker.number.int({ min: 8, max: 16 });

export const standaloneGraphCountForOrg = (faker: Faker): number => faker.number.int({ min: 6, max: 15 });

const graphsPerCollection = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 5, value: 0 },
    { weight: 10, value: 1 },
    { weight: 15, value: 2 },
    { weight: 18, value: 3 },
    { weight: 18, value: 4 },
    { weight: 15, value: 5 },
    { weight: 10, value: 6 },
    { weight: 6, value: 7 },
    { weight: 3, value: 8 }
  ]);

const carsPerGraph = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 35, value: 0 },
    { weight: 50, value: 1 },
    { weight: 12, value: 2 },
    { weight: 3, value: 3 }
  ]);

const pickGraphType = (faker: Faker): Graph_Type =>
  faker.helpers.weightedArrayElement([
    { weight: 14, value: Graph_Type.REIMBURSEMENT_TOTAL_BY_PROJECT },
    { weight: 8, value: Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM },
    { weight: 6, value: Graph_Type.REIMBURSEMENT_TOTAL_BY_DIVISION },
    { weight: 14, value: Graph_Type.PROJECT_BUDGET_BY_PROJECT },
    { weight: 10, value: Graph_Type.PROJECT_BUDGET_BY_TEAM },
    { weight: 8, value: Graph_Type.PROJECT_BUDGET_BY_DIVISION },
    { weight: 10, value: Graph_Type.CHANGE_REQUESTS_BY_PROJECT },
    { weight: 8, value: Graph_Type.CHANGE_REQUESTS_BY_TEAM },
    { weight: 8, value: Graph_Type.CHANGE_REQUESTS_BY_DIVISION },
    { weight: 8, value: Graph_Type.CHANGE_REQUESTS_BY_STATUS },
    { weight: 6, value: Graph_Type.PROJECT_BUDGET_VS_REIMBURSED_AMOUNT },
    { weight: 8, value: Graph_Type.ATTENDANCE_BY_TEAM },
    { weight: 6, value: Graph_Type.ATTENDANCE_BY_DIVISION }
  ]);

const pickDisplayType = (faker: Faker, graphType: Graph_Type): Graph_Display_Type =>
  graphType === Graph_Type.PROJECT_BUDGET_VS_REIMBURSED_AMOUNT
    ? Graph_Display_Type.BAR
    : faker.helpers.weightedArrayElement([
        { weight: 70, value: Graph_Display_Type.BAR },
        { weight: 30, value: Graph_Display_Type.PIE }
      ]);

const pickMeasure = (faker: Faker): Measure =>
  faker.helpers.weightedArrayElement([
    { weight: 88, value: Measure.SUM },
    { weight: 12, value: Measure.AVG }
  ]);

const pickSpecialPermissions = (faker: Faker, graphType: Graph_Type): Special_Permission[] =>
  graphType.startsWith('REIMBURSEMENT_TOTAL') && faker.datatype.boolean({ probability: 0.2 })
    ? [Special_Permission.FINANCE_ONLY]
    : [];

const pickViewPermissions = (faker: Faker): Special_Permission[] =>
  faker.datatype.boolean({ probability: 0.1 }) ? [Special_Permission.FINANCE_ONLY] : [];

export const carSpan = (cars: GraphCarRef[]): DateRange =>
  cars.reduce<DateRange>(
    (span, { dateRange }) => ({
      start: dateRange.start < span.start ? dateRange.start : span.start,
      end: dateRange.end > span.end ? dateRange.end : span.end
    }),
    cars[0].dateRange
  );

export const planGraphCollections = (
  faker: Faker,
  count: number,
  creators: GraphActor[],
  span: DateRange,
  now: Date
): GraphCollectionPlan[] => {
  const titles = faker.helpers.shuffle([...GRAPH_COLLECTION_TITLES]);
  // dateCreated/dateDeleted are real insertion timestamps, unlike startDate/endDate below (which
  // are just query-filter bounds a user can legitimately set into the future) - the car span can
  // extend past today for an ongoing car's season, so this must be capped at now.
  const creationEnd = new Date(Math.min(span.end.getTime(), now.getTime()));

  return Array.from({ length: count }, (_, i) => {
    const creatorId = faker.helpers.arrayElement(creators).userId;
    const dateCreated = generateRandomDate(faker, span.start, creationEnd);
    const deleted = faker.datatype.boolean({ probability: 0.3 });

    return {
      title: titles[i] ?? `Graph Collection ${i + 1}`,
      viewPermissions: pickViewPermissions(faker),
      creatorId,
      dateCreated,
      ...(deleted ? { dateDeleted: generateRandomDate(faker, dateCreated, creationEnd), deleterId: creatorId } : {})
    };
  });
};

const planGraph = (
  faker: Faker,
  creators: GraphActor[],
  cars: GraphCarRef[],
  creationWindow: DateRange,
  collectionIndex?: number
): GraphPlan => {
  const graphType = pickGraphType(faker);
  const connectedCars = faker.helpers.arrayElements(cars, Math.min(carsPerGraph(faker), cars.length));

  const hasDateRange = faker.datatype.boolean({ probability: 0.2 });
  const rangeCar = connectedCars[0] ?? faker.helpers.arrayElement(cars);
  // startDate/endDate are query-filter bounds (e.g. "show data through end of season"), not
  // creation timestamps - a future value here is a normal, valid filter, so this intentionally
  // uses the car's own raw dateRange rather than creationWindow.
  const dateRange = hasDateRange ? { startDate: rangeCar.dateRange.start, endDate: rangeCar.dateRange.end } : {};

  return {
    title: GRAPH_TITLE_BY_TYPE[graphType],
    graphType,
    displayGraphType: pickDisplayType(faker, graphType),
    measure: pickMeasure(faker),
    specialPermissions: pickSpecialPermissions(faker, graphType),
    creatorId: faker.helpers.arrayElement(creators).userId,
    dateCreated: generateRandomDate(faker, creationWindow.start, creationWindow.end),
    carIds: connectedCars.map((car) => car.carId),
    ...dateRange,
    ...(collectionIndex !== undefined ? { collectionIndex } : {})
  };
};

// Builds an all-time attendance graph (no date-range filter) so it always renders seeded
// Meeting_Attendance data. Attendance graphs have no car relation, so carIds is left empty.
const planAttendanceGraph = (
  faker: Faker,
  creators: GraphActor[],
  creationWindow: DateRange,
  graphType: Graph_Type,
  collectionIndex: number
): GraphPlan => ({
  title: GRAPH_TITLE_BY_TYPE[graphType],
  graphType,
  displayGraphType: Graph_Display_Type.BAR,
  measure: faker.helpers.arrayElement([Measure.SUM, Measure.AVG]),
  specialPermissions: [],
  creatorId: faker.helpers.arrayElement(creators).userId,
  dateCreated: generateRandomDate(faker, creationWindow.start, creationWindow.end),
  carIds: [],
  collectionIndex
});

export const planGraphs = (
  faker: Faker,
  collectionPlans: GraphCollectionPlan[],
  standaloneCount: number,
  creators: GraphActor[],
  cars: GraphCarRef[],
  span: DateRange,
  now: Date
): GraphPlan[] => {
  const graphs: GraphPlan[] = [];
  // createGraph rejects assigning a new graph to an already-deleted collection, so a graph's own
  // dateCreated must fall within its collection's [dateCreated, dateDeleted ?? now] window - not
  // just anywhere in the overall car span.
  const standaloneWindow: DateRange = { start: span.start, end: new Date(Math.min(span.end.getTime(), now.getTime())) };

  // Pick a visible (non-deleted) collection to showcase BOTH attendance graph types together.
  const showcaseIndex = Math.max(
    0,
    collectionPlans.findIndex((collectionPlan) => !collectionPlan.dateDeleted)
  );

  collectionPlans.forEach((collectionPlan, collectionIndex) => {
    const count = graphsPerCollection(faker);
    const creationWindow: DateRange = {
      start: collectionPlan.dateCreated,
      end: collectionPlan.dateDeleted ?? standaloneWindow.end
    };

    for (let i = 0; i < count; i++) {
      graphs.push(planGraph(faker, creators, cars, creationWindow, collectionIndex));
    }

    // Guarantee every collection surfaces an attendance graph so the new attendance statistics are
    // visible when browsing collections, not just as standalone graphs. One showcase collection gets
    // both Team and Division; the rest alternate to keep a single attendance graph each.
    if (collectionIndex === showcaseIndex) {
      graphs.push(planAttendanceGraph(faker, creators, creationWindow, Graph_Type.ATTENDANCE_BY_TEAM, collectionIndex));
      graphs.push(planAttendanceGraph(faker, creators, creationWindow, Graph_Type.ATTENDANCE_BY_DIVISION, collectionIndex));
    } else {
      const attendanceType = collectionIndex % 2 === 0 ? Graph_Type.ATTENDANCE_BY_TEAM : Graph_Type.ATTENDANCE_BY_DIVISION;
      graphs.push(planAttendanceGraph(faker, creators, creationWindow, attendanceType, collectionIndex));
    }
  });

  for (let i = 0; i < standaloneCount; i++) {
    graphs.push(planGraph(faker, creators, cars, standaloneWindow));
  }

  return graphs;
};

export const graphCollectionCreateInput = (
  organizationId: string,
  plan: GraphCollectionPlan
): Prisma.Graph_CollectionCreateInput => ({
  title: plan.title,
  viewPermissions: plan.viewPermissions,
  dateCreated: plan.dateCreated,
  organization: { connect: { organizationId } },
  userCreated: { connect: { userId: plan.creatorId } },
  ...(plan.dateDeleted ? { dateDeleted: plan.dateDeleted } : {}),
  ...(plan.deleterId ? { userDeleted: { connect: { userId: plan.deleterId } } } : {})
});

export const graphCreateInput = (
  organizationId: string,
  plan: GraphPlan,
  collectionId?: string
): Prisma.GraphCreateInput => ({
  title: plan.title,
  graphType: plan.graphType,
  displayGraphType: plan.displayGraphType,
  measure: plan.measure,
  specialPermissions: plan.specialPermissions,
  dateCreated: plan.dateCreated,
  ...(plan.startDate ? { startDate: plan.startDate } : {}),
  ...(plan.endDate ? { endDate: plan.endDate } : {}),
  organization: { connect: { organizationId } },
  userCreated: { connect: { userId: plan.creatorId } },
  ...(collectionId ? { graphCollection: { connect: { id: collectionId } } } : {}),
  ...(plan.carIds.length > 0 ? { cars: { connect: plan.carIds.map((carId) => ({ carId })) } } : {})
});
