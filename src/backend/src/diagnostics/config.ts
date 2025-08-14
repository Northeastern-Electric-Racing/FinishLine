import prisma from '../prisma/prisma';
import { BenchCtx, BenchSpec } from './bench-types';
import { userSpecs } from './users.spec';
import { organizationSpecs } from './organizations.spec';
import { teamSpecs } from './teams.spec';
import { wbsSpecs } from './wbs.spec';
import { wbsTemplateSpecs } from './wbs-templates.spec';
import { changeRequestSpecs } from './change-requests.spec';
import { taskSpecs } from './tasks.spec';
import { designReviewSpecs } from './design-reviews.spec';
import { bomSpecs } from './bom.spec';
import { financeSpecs } from './finance.spec';
import { partReviewSpecs } from './part-review.spec';
import { statisticsSpecs } from './statistics.spec';
import { onboardingSpecs } from './onboarding.spec';
import { carSpecs } from './cars.spec';

export const specs: BenchSpec<any>[] = [
  ...userSpecs,
  ...organizationSpecs,
  ...teamSpecs,
  ...wbsSpecs,
  ...wbsTemplateSpecs,
  ...changeRequestSpecs,
  ...taskSpecs,
  ...designReviewSpecs,
  ...bomSpecs,
  ...financeSpecs,
  ...partReviewSpecs,
  ...statisticsSpecs,
  ...onboardingSpecs,
  ...carSpecs
];

export const bootstrapBenchContext = async (): Promise<BenchCtx> => {
  let organizationId = process.env.DEV_ORGANIZATION_ID;
  if (!organizationId) {
    const org = await prisma.organization.findFirst();
    if (!org) throw new Error('No organization found to run benchmarks');
    const { organizationId: orgId } = org;
    organizationId = orgId;
  }

  const { userId: adminUserId } =
    (await prisma.user.findFirst({
      where: { roles: { some: { roleType: 'APP_ADMIN', organizationId } } },
      select: { userId: true }
    })) || ({} as { userId: string });
  const { userId: memberUserId } =
    (await prisma.user.findFirst({
      where: { roles: { some: { roleType: 'MEMBER', organizationId } } },
      select: { userId: true }
    })) || ({} as { userId: string });

  if (!adminUserId) throw new Error('No admin user found for organization');
  if (!memberUserId) throw new Error('No member user found for organization');

  return {
    organization: { organizationId },
    adminUser: { userId: adminUserId },
    memberUser: { userId: memberUserId }
  };
};
