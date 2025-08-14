import prisma from '../prisma/prisma';
import OnboardingServices from '../services/onboarding.services';
import { BenchSpec } from './bench-types';

export const onboardingSpecs: BenchSpec<any>[] = [
  {
    name: 'onboarding.getAllChecklists',
    tags: ['onboarding', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await OnboardingServices.getAllChecklists(organization);
    }
  },
  {
    name: 'onboarding.getCheckedChecklists',
    tags: ['onboarding', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await OnboardingServices.getCheckedChecklists(user, organization);
    }
  },
  {
    name: 'onboarding.getUsersChecklists',
    tags: ['onboarding', 'read'],
    async prepare(ctx) {
      return { inputs: { userId: ctx.memberUser.userId, organization: ctx.organization } };
    },
    async run({ userId, organization }) {
      await OnboardingServices.getUsersChecklists(userId, organization);
    }
  }
];
