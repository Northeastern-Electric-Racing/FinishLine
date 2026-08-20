import { readFileSync } from 'fs';

export type WeightedValue<T> = { weight: number; value: T };
export type NumberRange = { min: number; max: number };
export type WeightedCount =
  | {
      weight: number;
      value: number;
    }
  | {
      weight: number;
      min: number;
      max: number;
    };

export interface SeedConfig {
  car: {
    carCount: number;
  };
  descriptionBullet: {
    countWeights: WeightedValue<number>[];
  };
  reimbursementRequest: {
    productCountWeights: WeightedValue<number>[];
  };
  project: {
    // Intentionally 5, not the pre-config default of 30 - kept low so the default
    // `prisma migrate reset` seed stays fast; bump this to generate more volume.
    projectsPerCar: number;
  };
  user: {
    totalUsers: number;
  };
  team: {
    leadsPerTeam: NumberRange;
    membersPerTeam: NumberRange;
  };
  workPackage: {
    countWeights: WeightedValue<number>[];
  };
  changeRequest: {
    projectCountWeights: WeightedCount[];
    workPackageCountWeights: WeightedValue<number>[];
    accountCodeCountWeights: WeightedCount[];
  };
  sponsor: {
    sponsorCount: number;
    prospectiveSponsorCount: number;
  };
  organizationContent: {
    announcementContent: number;
    popupContent: number;
    guestDefinitionCount: number;
    checklistRootCount: number;
    faqCount: number;
  };
  graph: {
    graphCollectionsPerOrg: NumberRange;
    standaloneGraphsPerOrg: NumberRange;
  };
  part: {
    countForProject: WeightedCount[];
  };
  task: {
    countForProject: WeightedCount[];
  };
}

export const seedConfig: SeedConfig = JSON.parse(
  readFileSync(new URL('./seed-config.json', import.meta.url), 'utf-8')
) as SeedConfig;
