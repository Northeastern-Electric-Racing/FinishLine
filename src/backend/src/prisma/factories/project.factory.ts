import { Faker } from '@faker-js/faker';
import { Link_Type, Prisma, WBS_Element_Status } from '@prisma/client';
import dayjs from 'dayjs';
import { DateRange } from '../context.js';

export const PROJECTS_PER_CAR = 30;

const MIN_PROJECT_MONTHS = 3;
const MAX_PROJECT_MONTHS = 12;

const DAYS_PER_MONTH = 30;

const PROJECT_NAMES = [
  'Firewall',
  'TS Interface Panel',
  'Steering',
  'Shepherd BMS FW',
  'Flex Therm PCBs',
  'TSAL',
  'Argos',
  'Ergo Test Bench',
  'Driver IO',
  'Harness',
  'Headrest',
  'Tractive Wiring',
  'Floor',
  'Wiring',
  'Bodywork',
  'Chassis',
  'Motor Cooling',
  'Odyssey',
  'Seat',
  'Shepherd',
  'Proteus MC FW',
  'Pedal Box',
  'Cerberus MPU',
  'Lightning Board',
  'FSAE Competition Documents',
  'MPU',
  'Driver Comms',
  'NERO',
  'ML and Data',
  'Wings',
  'Lap Simulation',
  'Polaris',
  'PDU',
  'General Electrical',
  'Tire Modeling Tool',
  'Calendar Improvements',
  'Brake Light',
  'FinishLine',
  'Proteus MC HW',
  'Steering Wheel PCB',
  'BSPD',
  'Charger',
  'Mechanical Sensor Boards',
  'Vehicle Control Unit',
  'Rear Wing',
  'Segments',
  'Automotive Ethernet',
  'Battery Box',
  'Fusible Links',
  'Front Wing',
  'Underbody',
  'Firewall/Floor',
  'Operations Dashboard',
  'Telemetry Stand',
  'Marketing',
  'Tires',
  'HV Plate',
  'BMS Compute',
  'Transmission',
  'TS Wiring',
  'Jigs',
  'Rules Dashboard',
  'LV Wiring',
  'TSSI',
  'Bodywork Thermal',
  'Embedded Analysis',
  'Competition Registration Fees',
  'Trucks',
  'Spring Recruitment',
  'Competition Logistics',
  'BOM Usability',
  'Gantt Improvements',
  'Bay Dashboard',
  'Executive Summary',
  'Multibody',
  'Autonomous Control',
  'Real Time',
  'Simulation Product',
  'Wheels',
  'Charger Cart',
  'Suspension',
  'Simulation'
];

const VERSIONED_PROJECT_NAMES = ['Odyssey', 'Argos', 'NERO', 'Polaris'];

const PROJECT_SUMMARY_BY_NAME: Record<string, string> = {
  Firewall: 'Partitions and protects the driver from the rest of the car.',
  'TS Interface Panel': 'Integration with tractive system measurement points, energy meter, and high voltage disconnect.',
  Steering:
    "Design and validate the steering system, including the steering column, steering gear, and tie rods that transmit the driver's input to the wheels.",
  'Shepherd BMS FW': 'Develop firmware for the battery management system.',
  'Flex Therm PCBs': 'Design and validate thermistor and tap PCBs.',
  TSAL: 'Develop and validate the tractive system active light.',
  Argos: 'Build telemetry and data visualization tooling for car data.',
  'Ergo Test Bench': 'Create an adjustable ergonomics test bench for validating driver position.',
  'Driver IO': 'Develop steering wheel, dashboard, and driver-facing controls.',
  Harness: 'Design, manufacture, and validate vehicle wiring harnesses.',
  Headrest: 'Design and manufacture headrest components that keep the driver safe.',
  'Tractive Wiring': 'Design and validate tractive system high-current path wiring.',
  Floor: 'Design and manufacture the vehicle floor.',
  Wiring: 'Design and validate GLV, LV, and TS wiring.',
  Bodywork: 'Design and manufacture exterior bodywork components.',
  Chassis: 'Design and manufacture the structural core of the car.',
  'Motor Cooling': 'Design and manufacture a system to cool the motor and motor controller.',
  Odyssey: 'Develop FinishLine improvements for project management workflows.',
  Seat: 'Design and manufacture the driver seat and mounting interface.',
  Shepherd: 'Develop battery management system hardware and firmware.',
  'Proteus MC FW': 'Develop firmware for the motor controller.',
  'Pedal Box': 'Package and validate brake and throttle pedal systems.',
  'Cerberus MPU': 'Develop main processing unit hardware and firmware.',
  'Lightning Board': 'Design and validate low-voltage electronics.',
  'FSAE Competition Documents': 'Prepare competition documents and technical reports.',
  MPU: 'Develop main processing hardware and supporting firmware.',
  'Driver Comms': 'Develop driver communication and feedback systems.',
  NERO: 'Develop software tooling and dashboards for team operations.',
  'ML and Data': 'Develop data processing and analysis tooling.',
  Wings: 'Design and manufacture aerodynamic wing elements.',
  'Lap Simulation': 'Build lap simulation tooling to evaluate vehicle performance.',
  PDU: 'Design and validate the power distribution unit.',
  'General Electrical': 'Support general electrical integration and validation.',
  'Tire Modeling Tool': 'Build tooling for tire model analysis.',
  'Calendar Improvements': 'Improve scheduling and calendar workflows.',
  'Brake Light': 'Design and validate the brake light system.',
  FinishLine: 'Develop improvements to the FinishLine project management platform.',
  'Proteus MC HW': 'Design and validate motor controller hardware.',
  'Steering Wheel PCB': 'Design and validate the steering wheel PCB.',
  BSPD: 'Design and validate the brake system plausibility device.',
  Charger: 'Design and validate charging hardware and supporting systems.',
  'Mechanical Sensor Boards': 'Design and validate mechanical sensor boards.',
  'Vehicle Control Unit': 'Develop vehicle control hardware and software.',
  'Rear Wing': 'Design, manufacture, and test the rear aerodynamic package.',
  Segments: 'Develop segmented data and analysis workflows.',
  'Automotive Ethernet': 'Integrate automotive Ethernet communication systems.',
  'Battery Box': 'Design, manufacture, and validate the battery box assembly.',
  'Fusible Links': 'Design and validate fusible link components.',
  'Front Wing': 'Design, manufacture, and test the front aerodynamic package.',
  Underbody: 'Design and manufacture underbody aerodynamic components.',
  'Firewall/Floor': 'Design and manufacture firewall and floor interface components.',
  'Operations Dashboard': 'Build dashboards for operations and team management.',
  'Telemetry Stand': 'Build a stand for telemetry collection and display.',
  Marketing: 'Support marketing and outreach initiatives.',
  Tires: 'Support tire selection, modeling, and testing.',
  'HV Plate': 'Package and validate high-voltage plate components.',
  'BMS Compute': 'Develop compute systems for battery management.',
  Transmission: 'Design and validate drivetrain transmission components.',
  'TS Wiring': 'Design and validate tractive system wiring.',
  Jigs: 'Design and manufacture jigs for repeatable assembly.',
  'Rules Dashboard': 'Build tooling for tracking rules compliance.',
  'LV Wiring': 'Design and validate low-voltage wiring.',
  TSSI: 'Develop tractive system safety interface components.',
  'Bodywork Thermal': 'Analyze and improve bodywork thermal behavior.',
  'Embedded Analysis': 'Develop embedded systems analysis tooling.',
  'Competition Registration Fees': 'Track and support competition registration.',
  Trucks: 'Support truck and logistics planning for competition.',
  'Spring Recruitment': 'Support spring recruitment planning and execution.',
  'Competition Logistics': 'Plan and execute competition logistics.',
  'BOM Usability': 'Improve bill of materials workflows.',
  'Gantt Improvements': 'Improve project timeline and Gantt chart workflows.',
  'Bay Dashboard': 'Build dashboards for bay activity and operations.',
  'Executive Summary': 'Prepare executive-level project and competition summaries.',
  Multibody: 'Develop multibody vehicle simulation models.',
  'Autonomous Control': 'Develop autonomous vehicle control logic.',
  'Real Time': 'Develop real-time telemetry and visualization workflows.',
  'Simulation Product': 'Develop simulation tooling for vehicle performance analysis.',
  Wheels: 'Design and validate wheel-end components.',
  'Charger Cart': 'Design and manufacture the charger cart.',
  Suspension: 'Design and validate suspension components.',
  Simulation: 'Develop simulation models for vehicle performance analysis.'
};

const PROJECT_LINK_URL_BY_TYPE: Record<string, (projectSlug: string) => string> = {
  Confluence: (projectSlug) => `https://nerdocs.atlassian.net/wiki/spaces/NER/pages/${projectSlug}`,
  Github: (projectSlug) => `https://github.com/Northeastern-Electric-Racing/${projectSlug}`,
  Altium: (projectSlug) => `https://northeastern-fsae.365.altium.com/designs/${projectSlug}`,
  'Google Drive': (projectSlug) => `https://drive.google.com/drive/folders/${projectSlug}`
};

const clampDate = (date: Date, min: Date, max: Date): Date => {
  if (date < min) return new Date(min);
  if (date > max) return new Date(max);
  return date;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const daysBetween = ({ start, end }: DateRange): number => Math.max(0, dayjs(end).diff(dayjs(start), 'day'));

const TARGET_BUDGET_PER_CAR = 80_000;

export const generateProjectBudgets = (
  faker: Faker,
  projectCount: number,
  targetBudget = TARGET_BUDGET_PER_CAR
): number[] => {
  const weights = Array.from({ length: projectCount }, (): number => {
    const bucket = faker.number.int({ min: 1, max: 100 });

    if (bucket <= 5) return 0;
    if (bucket <= 75) return faker.number.float({ min: 0.3, max: 1.2 });
    if (bucket <= 95) return faker.number.float({ min: 1.2, max: 3 });
    return faker.number.float({ min: 3, max: 7 });
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) {
    return [targetBudget, ...Array.from({ length: projectCount - 1 }, () => 0)];
  }

  const budgets = weights.map((weight) => Math.round((targetBudget * weight) / totalWeight / 100) * 100);

  const currentTotal = budgets.reduce((sum, budget) => sum + budget, 0);
  const difference = targetBudget - currentTotal;

  const largestBudgetIndex = budgets.reduce(
    (largestIndex, budget, index) => (budget > budgets[largestIndex] ? index : largestIndex),
    0
  );

  budgets[largestBudgetIndex] += difference;

  return budgets;
};

export const generateProjectTimeline = (faker: Faker, carDateRange: DateRange): DateRange => {
  const carStart = new Date(carDateRange.start);
  const carEnd = new Date(carDateRange.end);

  const durationMonths = faker.number.int({
    min: MIN_PROJECT_MONTHS,
    max: MAX_PROJECT_MONTHS
  });

  const durationDays = durationMonths * DAYS_PER_MONTH;
  const availableDays = daysBetween({ start: carStart, end: carEnd });
  const latestStartOffset = Math.max(0, availableDays - durationDays);

  const start = addDays(
    carStart,
    faker.number.int({
      min: 0,
      max: latestStartOffset
    })
  );

  const end = clampDate(addDays(start, durationDays), carStart, carEnd);

  return { start, end };
};

export const projectNameForIndex = (faker: Faker, index: number): string => {
  const baseName = PROJECT_NAMES[index % PROJECT_NAMES.length];

  if (VERSIONED_PROJECT_NAMES.includes(baseName)) {
    return `${baseName} ${faker.number.int({ min: 24, max: 27 })}`;
  }

  return baseName;
};

export const projectSummaryForName = (name: string): string => {
  const matchingName = PROJECT_NAMES.find((projectName) => name.startsWith(projectName));

  if (!matchingName) {
    return `Plan, design, manufacture, and validate ${name.toLowerCase()}.`;
  }

  return PROJECT_SUMMARY_BY_NAME[matchingName] ?? `Develop ${matchingName.toLowerCase()} for the car.`;
};

export const projectAbbreviationForName = (name: string, projectNumber: number): string => {
  const abbreviation = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 6);

  return `${abbreviation}${projectNumber}`;
};

const projectSlugForName = (projectName: string): string =>
  projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const projectLinksCreateInput = (
  projectName: string,
  linkTypes: Link_Type[],
  creatorId: string
): Prisma.LinkCreateWithoutWbsElmentInput[] => {
  const projectSlug = projectSlugForName(projectName);

  return linkTypes
    .filter((linkType) => linkType.name in PROJECT_LINK_URL_BY_TYPE)
    .map((linkType) => ({
      url: PROJECT_LINK_URL_BY_TYPE[linkType.name](projectSlug),
      creator: {
        connect: { userId: creatorId }
      },
      linkType: {
        connect: { id: linkType.id }
      }
    }));
};

export const projectCreateInput = (
  organizationId: string,
  carId: string,
  carNumber: number,
  projectNumber: number,
  projectName: string,
  teamIds: string[],
  leadId?: string,
  managerId?: string,
  linkTypes: Link_Type[] = [],
  linkCreatorId?: string,
  overrides: Partial<Prisma.ProjectCreateInput> = {}
): Prisma.ProjectCreateInput => ({
  summary: projectSummaryForName(projectName),
  budget: 0,
  abbreviation: projectAbbreviationForName(projectName, projectNumber),
  car: {
    connect: { carId }
  },
  teams: {
    connect: teamIds.map((teamId) => ({ teamId }))
  },
  wbsElement: {
    create: {
      name: projectName,
      carNumber,
      projectNumber,
      workPackageNumber: 0,
      status: WBS_Element_Status.ACTIVE,
      organization: {
        connect: { organizationId }
      },
      ...(leadId
        ? {
            lead: {
              connect: { userId: leadId }
            }
          }
        : {}),
      ...(managerId
        ? {
            manager: {
              connect: { userId: managerId }
            }
          }
        : {}),
      ...(linkCreatorId && linkTypes.length > 0
        ? {
            links: {
              create: projectLinksCreateInput(projectName, linkTypes, linkCreatorId)
            }
          }
        : {})
    }
  },
  ...overrides
});

export const projectTemplateCreateInput = (
  organizationId: string,
  userCreatedId: string,
  templateName: string,
  projectName: string,
  teamIds: string[]
): Prisma.WBS_Element_TemplateCreateInput => ({
  templateName,
  templateNotes: `Seed template for ${projectName}.`,
  wbsElementName: projectName,
  userCreated: {
    connect: { userId: userCreatedId }
  },
  organization: {
    connect: { organizationId }
  },
  projectTemplate: {
    create: {
      summary: projectSummaryForName(projectName),
      budget: 0,
      teams: {
        connect: teamIds.map((teamId) => ({ teamId }))
      }
    }
  }
});
