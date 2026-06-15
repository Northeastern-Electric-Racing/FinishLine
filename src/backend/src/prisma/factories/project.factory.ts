import { Faker } from '@faker-js/faker';
import { Prisma, Team, WBS_Element_Status } from '@prisma/client';
import { DateRange } from '../context.js';

export const PROJECTS_PER_CAR = 30;

const MIN_PROJECT_MONTHS = 3;
const MAX_PROJECT_MONTHS = 12;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30;

const PROJECT_NAME_PARTS = [
  'Accumulator',
  'Battery Box',
  'Brake Pedal',
  'Brake System',
  'Cooling Loop',
  'DAQ Harness',
  'Dashboard',
  'Drivetrain',
  'Firewall',
  'Front Wing',
  'HV Disconnect',
  'Impact Attenuator',
  'Inverter Mount',
  'LV Battery',
  'Main Hoop',
  'Motor Controller',
  'Nose Cone',
  'Pedal Box',
  'Power Distribution',
  'Rear Wing',
  'Seat Mount',
  'Shutdown Circuit',
  'Steering Rack',
  'Suspension Geometry',
  'Telemetry System',
  'Tractive System',
  'Vehicle Controls',
  'Wheel Assembly',
  'Wiring Harness',
  'Yaw Sensor'
];

const PROJECT_QUALIFIERS = [
  'Design',
  'Integration',
  'Manufacturing',
  'Validation',
  'Testing',
  'Redesign',
  'Optimization',
  'Packaging',
  'Prototype',
  'Assembly'
];

const PROJECT_SUMMARY_BY_PART: Record<string, string> = {
  Accumulator: 'Design and validate the accumulator subsystem for the car.',
  'Battery Box': 'Design, manufacture, and validate the battery box assembly.',
  'Brake Pedal': 'Develop the brake pedal and pedal box interface.',
  'Brake System': 'Design and validate hydraulic braking components.',
  'Cooling Loop': 'Build and test the cooling loop for thermal management.',
  'DAQ Harness': 'Create the data acquisition harness and sensor wiring.',
  Dashboard: 'Develop the driver-facing dashboard and controls.',
  Drivetrain: 'Integrate drivetrain components and validate performance.',
  Firewall: 'Design and manufacture rules-compliant firewall components.',
  'Front Wing': 'Design, manufacture, and test front aerodynamic elements.',
  'HV Disconnect': 'Develop high-voltage disconnect and safety interfaces.',
  'Impact Attenuator': 'Develop a rules-compliant impact attenuator.',
  'Inverter Mount': 'Package and mount the inverter assembly.',
  'LV Battery': 'Develop the low-voltage battery and supporting circuits.',
  'Main Hoop': 'Design and validate the main hoop structure.',
  'Motor Controller': 'Integrate motor controller hardware and software.',
  'Nose Cone': 'Design and manufacture the nose cone assembly.',
  'Pedal Box': 'Package brake and throttle pedal systems.',
  'Power Distribution': 'Build and validate vehicle power distribution.',
  'Rear Wing': 'Design, manufacture, and test rear aerodynamic elements.',
  'Seat Mount': 'Design and manufacture driver seat mounting hardware.',
  'Shutdown Circuit': 'Implement and validate the shutdown safety circuit.',
  'Steering Rack': 'Design and validate the steering rack and linkage.',
  'Suspension Geometry': 'Develop suspension geometry and mounting points.',
  'Telemetry System': 'Build telemetry collection and wireless data systems.',
  'Tractive System': 'Design and validate tractive system wiring and safety.',
  'Vehicle Controls': 'Develop vehicle control logic and driver interfaces.',
  'Wheel Assembly': 'Design and validate wheel-end components.',
  'Wiring Harness': 'Design, manufacture, and validate vehicle wiring harnesses.',
  'Yaw Sensor': 'Integrate yaw sensing and vehicle dynamics data collection.'
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

const daysBetween = (start: Date, end: Date): number =>
  Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY));

export const generateProjectTimeline = (faker: Faker, carDateRange: DateRange): DateRange => {
  const carStart = new Date(carDateRange.start);
  const carEnd = new Date(carDateRange.end);

  const durationMonths = faker.number.int({
    min: MIN_PROJECT_MONTHS,
    max: MAX_PROJECT_MONTHS
  });

  const durationDays = durationMonths * DAYS_PER_MONTH;
  const availableDays = daysBetween(carStart, carEnd);
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
  const part = PROJECT_NAME_PARTS[index % PROJECT_NAME_PARTS.length];
  const qualifier = faker.helpers.arrayElement(PROJECT_QUALIFIERS);

  return `${part} ${qualifier}`;
};

export const projectSummaryForName = (name: string): string => {
  const matchingPart = PROJECT_NAME_PARTS.find((part) => name.startsWith(part));

  if (!matchingPart) {
    return `Plan, design, manufacture, and validate ${name.toLowerCase()}.`;
  }

  return PROJECT_SUMMARY_BY_PART[matchingPart] ?? `Develop ${matchingPart.toLowerCase()} for the car.`;
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

export const projectCreateInput = (
  faker: Faker,
  organizationId: string,
  carId: string,
  carNumber: number,
  projectNumber: number,
  projectName: string,
  teamIds: string[],
  leadId?: string,
  managerId?: string,
  overrides: Partial<Prisma.ProjectCreateInput> = {}
): Prisma.ProjectCreateInput => ({
  summary: projectSummaryForName(projectName),
  budget: faker.number.int({ min: 500, max: 12_000 }),
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
      organizationId,
      ...(leadId ? { lead: { connect: { userId: leadId } } } : {}),
      ...(managerId ? { manager: { connect: { userId: managerId } } } : {})
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