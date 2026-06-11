import { Faker } from '@faker-js/faker';
import { Prisma, Team_Type } from '@prisma/client';
import type { FullUser } from '../context.js';

const SLACK_ID_RANDOM_LENGTH = 4;

export type SeedTeamConfig = {
  teamName: string;
  description: string;
  teamTypeName: string;
  financeTeam?: boolean;
};

export const seedTeamConfigs: SeedTeamConfig[] = [
  {
    teamName: 'Mechanical',
    description: 'Designs and manufactures mechanical systems for the car.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Powertrain',
    description: 'Develops drivetrain and high-voltage powertrain systems.',
    teamTypeName: 'Electrical'
  },
  {
    teamName: 'Electrical',
    description: 'Builds and maintains the car electrical architecture.',
    teamTypeName: 'Electrical'
  },
  {
    teamName: 'Software',
    description: 'Develops FinishLine, telemetry, and vehicle software.',
    teamTypeName: 'Software'
  },
  {
    teamName: 'Embedded Systems',
    description: 'Works on firmware and embedded controls.',
    teamTypeName: 'Software'
  },
  {
    teamName: 'Controls',
    description: 'Develops vehicle control systems and performance tools.',
    teamTypeName: 'Software'
  },
  {
    teamName: 'Battery',
    description: 'Designs and validates the battery pack and accumulator systems.',
    teamTypeName: 'Electrical'
  },
  {
    teamName: 'Aerodynamics',
    description: 'Designs aero components and validates vehicle airflow.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Chassis',
    description: 'Develops the frame and structural systems.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Suspension',
    description: 'Designs suspension geometry and handling systems.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Brakes',
    description: 'Develops braking systems and pedal box components.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Composites',
    description: 'Manufactures composite bodywork and structural parts.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Manufacturing',
    description: 'Coordinates machining, fabrication, and shop work.',
    teamTypeName: 'Mechanical'
  },
  {
    teamName: 'Operations',
    description: 'Coordinates logistics, planning, and internal processes.',
    teamTypeName: 'Business'
  },
  {
    teamName: 'Finance',
    description: 'Manages purchasing, reimbursements, budgeting, and sponsor funds.',
    teamTypeName: 'Business',
    financeTeam: true
  },
  {
    teamName: 'Sponsorship',
    description: 'Manages sponsor outreach and sponsor relationships.',
    teamTypeName: 'Business'
  },
  {
    teamName: 'Marketing',
    description: 'Creates team media, branding, and public-facing content.',
    teamTypeName: 'Business'
  },
  {
    teamName: 'Recruitment',
    description: 'Supports recruiting, onboarding, and member engagement.',
    teamTypeName: 'Business'
  },
  {
    teamName: 'Data Acquisition',
    description: 'Builds telemetry, sensors, and data analysis tools.',
    teamTypeName: 'Electrical'
  },
  {
    teamName: 'Driver Interface',
    description: 'Develops cockpit, dashboard, and driver-facing controls.',
    teamTypeName: 'Electrical'
  }
];

const connectUsers = (users: FullUser[]) => users.map((user) => ({ userId: user.userId }));

const slackIdForTeam = (faker: Faker, teamName: string): string => {
  const slug = teamName.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-');

  return `seed-${slug}-${faker.string.alphanumeric(SLACK_ID_RANDOM_LENGTH).toLowerCase()}`;
};

const findTeamType = (teamTypesByName: Record<string, Team_Type>, teamTypeName: string): Team_Type => {
  const teamType = teamTypesByName[teamTypeName];

  if (!teamType) {
    throw new Error(`Missing team type: ${teamTypeName}`);
  }

  return teamType;
};

export const teamCreateInput = (
  faker: Faker,
  organizationId: string,
  head: FullUser,
  leads: FullUser[],
  members: FullUser[],
  teamTypesByName: Record<string, Team_Type>,
  config: SeedTeamConfig,
  overrides: Partial<Prisma.TeamCreateInput> = {}
): Prisma.TeamCreateInput => {
  const teamType = findTeamType(teamTypesByName, config.teamTypeName);

  return {
    teamName: config.teamName,
    slackId: slackIdForTeam(faker, config.teamName),
    description: config.description,
    financeTeam: config.financeTeam ?? false,
    head: {
      connect: { userId: head.userId }
    },
    leads: {
      connect: connectUsers(leads)
    },
    members: {
      connect: connectUsers(members)
    },
    teamType: {
      connect: { teamTypeId: teamType.teamTypeId }
    },
    organization: {
      connect: { organizationId }
    },
    ...overrides
  };
};
