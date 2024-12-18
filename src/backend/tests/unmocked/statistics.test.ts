import { Graph_Display_Type, Graph_Type, Organization, User } from '@prisma/client';
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
import { Measure } from 'shared';

describe('Statistics Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;

  let expectedCreatedGraphBase: any;

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(supermanAdmin, organization.organizationId);
    orgId = organization.organizationId;
    expectedCreatedGraphBase = {
      title: 'New Graph',
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
            Graph_Type.CHANGE_REQUESTS_BY_TEAM,
            Measure.SUM,
            Graph_Display_Type.BAR,
            organization,
            [],
            []
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
            Graph_Type.CHANGE_REQUESTS_BY_DIVISION,
            Measure.SUM,
            Graph_Display_Type.PIE,
            organization,
            [],
            []
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
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.SUM,
        Graph_Display_Type.BAR,
        organization,
        [],
        []
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR'
      });
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
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.AVG,
        Graph_Display_Type.BAR,
        organization,
        [],
        []
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR',
        measure: Measure.AVG
      });
      expect(result.startDate).toStrictEqual(new Date('12/12/2024'));
      expect(result.endDate).toStrictEqual(new Date(new Date('12/12/2024').getTime() + 10000));

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 1000
        }
      ]);
    });

    it('Create graph works for getting average project budget by division neglecting deleted projects', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2, new Date());

      const result = await StatisticsService.createGraph(
        user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.SUM,
        Graph_Display_Type.BAR,
        organization,
        [],
        []
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR',
        measure: Measure.SUM
      });
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
        Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM,
        Measure.AVG,
        Graph_Display_Type.PIE,
        organization,
        [],
        []
      );

      const result = await StatisticsService.getSingleGraph(graph.graphId, user, organization);
      expect(result.graphId).toBe(graph.graphId);
    });

    it('View graph fails if user does not have permission', async () => {
      const guest_user = await createTestUser(wonderwomanGuest, orgId);
      const graph = await StatisticsService.createGraph(
        user,
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000),
        'New Graph',
        Graph_Type.CHANGE_REQUESTS_BY_PROJECT,
        Measure.AVG,
        Graph_Display_Type.PIE,
        organization,
        [],
        []
      );

      await expect(async () => StatisticsService.getSingleGraph(graph.graphId, guest_user, organization)).rejects.toThrow(
        new AccessDeniedException('You do not have permission to view graphs')
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
