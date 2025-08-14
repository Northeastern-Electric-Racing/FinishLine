import prisma from '../prisma/prisma';
import StatisticsService from '../services/statistics.services';
import { BenchSpec } from './bench-types';

export const statisticsSpecs: BenchSpec<any>[] = [
  {
    name: 'statistics.getAllGraphCollections',
    tags: ['statistics', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await StatisticsService.getAllGraphCollections(user, organization);
    }
  }
];
