import { Graph_Type, Organization, User, Graph_Display_Type } from '@prisma/client';
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
import { Measure, SpecialPermission } from 'shared';
import prisma from '../../src/prisma/prisma';

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
            'New Graph',
            Graph_Type.CHANGE_REQUESTS_BY_TEAM,
            Measure.SUM,
            Graph_Display_Type.BAR,
            organization,
            [],
            [],
            new Date(),
            new Date(new Date().getTime() + 10000)
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permission to create a graph'));
    });

    it('Throws if end date is before start date', async () => {
      await expect(
        async () =>
          await StatisticsService.createGraph(
            user,
            'New Graph',
            Graph_Type.CHANGE_REQUESTS_BY_DIVISION,
            Measure.SUM,
            Graph_Display_Type.PIE,
            organization,
            [],
            [],
            new Date('12/12/2024'),
            new Date(new Date('12/12/2024').getTime() - 10000)
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
        'New Graph',
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.SUM,
        Graph_Display_Type.BAR,
        organization,
        [],
        [],
        new Date('12/12/1970'),
        new Date(new Date('12/12/2024').getTime() + 10000)
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR'
      });

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 2000
        }
      ]);
    });

    it('Create graph works for getting average project budget by division and using Pie Chart', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2);

      const result = await StatisticsService.createGraph(
        user,
        'New Graph',
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.AVG,
        Graph_Display_Type.PIE,
        organization,
        [],
        [],
        new Date('12/12/1970'),
        new Date(new Date('12/12/2024').getTime() + 10000)
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'PIE',
        measure: Measure.AVG
      });
      expect(result.startDate).toStrictEqual(new Date('12/12/1970'));
      expect(result.endDate?.getTime()).toBeGreaterThan(new Date('12/12/2024').getTime());

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
        'New Graph',
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.SUM,
        Graph_Display_Type.BAR,
        organization,
        [],
        [],
        new Date('12/12/1970'),
        new Date(new Date().getTime() + 100000)
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR',
        measure: Measure.SUM
      });
      expect(result.startDate).toStrictEqual(new Date('12/12/1970'));
      expect(result.endDate?.getTime()).toBeGreaterThan(new Date('12/12/2024').getTime());

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 1000
        }
      ]);
    });

    it('Create graph works for undefined start and end times', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2, new Date());

      const result = await StatisticsService.createGraph(
        user,
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
      expect(result.startDate).toStrictEqual(undefined);
      expect(result.endDate).toStrictEqual(undefined);

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 1000
        }
      ]);
    });

    it('Create graph works for filtering out times outside of date range', async () => {
      const division = await createTestTeamType(orgId);
      const team = await createTestTeam(user.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, team.teamId, car.carId);
      await createTestProject(user, orgId, team.teamId, car.carId, 2, new Date());

      const result = await StatisticsService.createGraph(
        user,
        'New Graph',
        Graph_Type.PROJECT_BUDGET_BY_DIVISION,
        Measure.SUM,
        Graph_Display_Type.BAR,
        organization,
        [],
        [],
        new Date('12/12/1970'),
        new Date('12/12/1971')
      );

      expect(result).toContain({
        ...expectedCreatedGraphBase,
        graphType: 'PROJECT_BUDGET_BY_DIVISION',
        graphDisplayType: 'BAR',
        measure: Measure.SUM
      });
      expect(result.startDate).toStrictEqual(new Date('12/12/1970'));
      expect(result.endDate).toStrictEqual(new Date('12/12/1971'));

      expect(result.graphData).toStrictEqual([
        {
          label: 'aTeam',
          value: 0
        }
      ]);
    });
  });

  describe('Get Single Graph', () => {
    it('Get single graph works for valid id', async () => {
      const graph = await StatisticsService.createGraph(
        user,
        'New Graph',
        Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM,
        Measure.AVG,
        Graph_Display_Type.PIE,
        organization,
        [],
        [],
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000)
      );

      const result = await StatisticsService.getSingleGraph(graph.graphId, user, organization);
      expect(result.graphId).toBe(graph.graphId);
    });

    it('View graph fails if user does not have permission', async () => {
      const guest_user = await createTestUser(wonderwomanGuest, orgId);
      const graph = await StatisticsService.createGraph(
        user,
        'New Graph',
        Graph_Type.CHANGE_REQUESTS_BY_PROJECT,
        Measure.AVG,
        Graph_Display_Type.PIE,
        organization,
        [],
        [],
        new Date('12/12/2024'),
        new Date(new Date('12/12/2024').getTime() + 10000)
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

  describe('Get all graph collections', () => {
    // const graphGen: GraphGen = {
    //   finalColumn: 'budget',
    //   finalTable: 'Project',
    //   groupByColumn: 'name',
    //   queryPath: {
    //     table: 'Team_Type',
    //     primaryKey: 'teamTypeId',
    //     next: {
    //       table: 'Team',
    //       primaryKey: 'teamId',
    //       parentForeignKey: 'teamTypeId',
    //       next: {
    //         table: '_assignedBy',
    //         primaryKey: 'A',
    //         parentForeignKey: 'B',
    //         next: {
    //           table: 'Project',
    //           primaryKey: 'projectId',
    //           parentForeignKey: 'projectId'
    //         }
    //       }
    //     }
    //   }
    // };

    it('Succeeds and gets all the graphs', async () => {
      const graph1 = await prisma.graph.create({
        data: {
          title: 'graph1',
          graphType: Graph_Type.CHANGE_REQUESTS_BY_DIVISION,
          displayGraphType: Graph_Display_Type.BAR,
          measure: Measure.AVG,
          userCreatedId: user.userId,
          organizationId: orgId
        }
      });

      const graph2 = await prisma.graph.create({
        data: {
          title: 'graph2',
          graphType: Graph_Type.PROJECT_BUDGET_BY_PROJECT,
          displayGraphType: Graph_Display_Type.PIE,
          measure: Measure.SUM,
          userCreatedId: user.userId,
          organizationId: orgId
        }
      });

      const graphCollection1 = await prisma.graph_Collection.create({
        data: {
          title: 'Graph Collection 1',
          viewPermissions: [SpecialPermission.FINANCE_ONLY],
          graphs: {
            connect: [{ id: graph1.id }, { id: graph2.id }]
          },
          userCreatedId: user.userId,
          organizationId: orgId
        }
      });

      const graphCollection2 = await prisma.graph_Collection.create({
        data: {
          title: 'Graph Collection 2',
          viewPermissions: [SpecialPermission.FINANCE_ONLY],
          graphs: {
            connect: [{ id: graph1.id }, { id: graph2.id }]
          },
          userCreatedId: user.userId,
          organizationId: orgId
        }
      });

      const result = await StatisticsService.getAllGraphCollections(organization);
      expect(result[0].userCreated.userId).toBe(user.userId);
      expect(result.length).toBe(2);
      expect(
        result.map((graphCol) => {
          return graphCol.id;
        })
      ).toEqual([graphCollection1.id, graphCollection2.id]);
    });
  });
});
