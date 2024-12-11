import { Graph_Type, Measure, Organization, User } from '@prisma/client';
import StatisticsService from '../../services/statistics.services';
import { GraphGen } from 'shared';

export const seedGraph = async (
  startDate: Date,
  endDate: Date,
  title: string,
  graphType: Graph_Type,
  graphGen: GraphGen,
  measure: Measure,
  userCreated: User,
  organization: Organization
) => {
  const createdGraph = await StatisticsService.createGraph(
    userCreated,
    startDate,
    endDate,
    title,
    graphType,
    measure,
    graphGen,
    organization
  );
  return createdGraph;
};
