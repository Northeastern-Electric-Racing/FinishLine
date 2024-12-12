import { Graph_Type, Organization, User } from '@prisma/client';
import { supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestTeam,
  createTestTeamType,
  createTestUser,
  resetUsers
} from '../test-utils';
import StatisticsService from '../../src/services/statistics.services';
import { AccessDeniedException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { GraphGen, GraphType, Measure } from 'shared';

describe('Statistics Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  const graphGen: GraphGen = {
    finalColumn: 'budget',
    finalTable: 'Project',
    groupByColumn: 'name',
    queryPath: {
      table: 'Team_Type',
      primaryKey: 'teamTypeId',
      next: {
        table: 'Team',
        primaryKey: 'teamId',
        parentForeignKey: 'teamTypeId',
        next: {
          table: '_assignedBy',
          primaryKey: 'A',
          parentForeignKey: 'B',
          next: {
            table: 'Project',
            primaryKey: 'projectId',
            parentForeignKey: 'projectId'
          }
        }
      }
    }
  };

  let expectedCreatedGraph: any;

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(supermanAdmin, organization.organizationId);
    orgId = organization.organizationId;
    expectedCreatedGraph = {
      title: 'New Graph',
      graphType: 'BAR',
      finalTable: 'Project',
      finalColumn: 'budget',
      groupByColumn: 'name',
      measure: 'SUM',
      userCreatedId: user.userId,
      userDeletedId: null,
      organizationId: orgId
    };
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Graph', () => {
    it('Create graph fails if user does not have permission', async () => {
      await expect(
        async () =>
          await StatisticsService.createGraph(
            await createTestUser(wonderwomanGuest, orgId),
            new Date(),
            new Date(new Date().getTime() + 10000),
            'New Graph',
            Graph_Type.BAR,
            Measure.SUM,
            graphGen,
            organization
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permission to create a graph'));
    });

    it('Throws if end date is before start date', async () => {
      await expect(
        async () =>
          await StatisticsService.createGraph(
            user,
            new Date('12/12/2024'),
            new Date(new Date('12/12/2024').getTime() - 10000),
            'New Graph',
            Graph_Type.BAR,
            Measure.SUM,
            graphGen,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'End date must be after start date'));
    });

    it('Create graph works for getting total project budget by division', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2);

      const result = await StatisticsService.createGraph(
        user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        GraphType.BAR,
        Measure.SUM,
        graphGen,
        organization
      );

      expect(result).toContain(expectedCreatedGraph);
      expect(result.startDate).toStrictEqual(new Date('12/12/2024'));
      expect(result.endDate).toStrictEqual(new Date(new Date('12/12/2024').getTime() + 10000));

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 2000
        }
      ]);
    });

    it('Create graph works for getting average project budget by division', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2);

      const result = await StatisticsService.createGraph(
        user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        GraphType.BAR,
        Measure.AVG,
        graphGen,
        organization
      );

      expect(result).toContain({ ...expectedCreatedGraph, measure: Measure.AVG });
      expect(result.startDate).toStrictEqual(new Date('12/12/2024'));
      expect(result.endDate).toStrictEqual(new Date(new Date('12/12/2024').getTime() + 10000));

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 1000
        }
      ]);
    });
  });

  describe('Get Single Graph', () => {
    it('Get single graph works for valid id', async () => {
      const graph = await StatisticsService.createGraph(
        user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        GraphType.BAR,
        Measure.AVG,
        graphGen,
        organization
      );

      const result = await StatisticsService.getSingleGraph(graph.graphId, user, organization);
      expect(result.graphId).toBe(graph.graphId);
    });

    it('View graph fails if user does not have permission', async () => {
      const guest_user = await createTestUser(wonderwomanGuest, orgId);
      const graph = await StatisticsService.createGraph(
        guest_user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        GraphType.BAR,
        Measure.AVG,
        graphGen,
        organization
      );

      await expect(async () => StatisticsService.getSingleGraph(graph.graphId, guest_user, organization)).rejects.toThrow(
        new AccessDeniedException('You do not have permission to view a graph')
      );
    });

    it('Get single graph fails with invalid id', async () => {
      const invalidGraphId = 'invalidId';
      await expect(async () => StatisticsService.getSingleGraph(invalidGraphId, user, organization)).rejects.toThrow(
        new NotFoundException('Graph', invalidGraphId)
      );
    });
  });
});
