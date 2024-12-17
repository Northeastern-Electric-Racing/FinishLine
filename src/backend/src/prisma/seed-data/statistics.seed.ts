import { Graph_Display_Type, Graph_Type, Measure, Organization, User } from '@prisma/client';
import StatisticsService from '../../services/statistics.services';

export const seedGraph = async (
  startDate: Date,
  endDate: Date,
  title: string,
  graphType: Graph_Type,
  graphDisplayType: Graph_Display_Type,
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
    graphDisplayType,
    organization
  );

  return createdGraph;
};
