import { Graph_Type, Organization, User, Graph_Display_Type, Special_Permission } from '@prisma/client';
import { batmanAppAdmin, supermanAdmin, theVisitorGuest, wonderwomanGuest } from '../test-data/users.test-data';
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
import { Graph, Measure, SpecialPermission } from 'shared';
import prisma from '../../src/prisma/prisma';

describe('Statistics Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  let graph: Graph;
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
    graph = await StatisticsService.createGraph(
      user,
      'New Graph',
      Graph_Type.PROJECT_BUDGET_BY_TEAM,
      Measure.SUM,
      Graph_Display_Type.BAR,
      organization,
      [],
      [],
      new Date(),
      new Date(new Date().getTime() + 10000)
    );
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
      const division = await createTestTeamType(undefined, orgId);
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
      const division = await createTestTeamType(undefined, orgId);
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
      const division = await createTestTeamType(undefined, orgId);
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
      const division = await createTestTeamType(undefined, orgId);
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
      const division = await createTestTeamType(undefined, orgId);
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
    it('Succeeds and gets all the graphs the user has permission to see without permissions', async () => {
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
          viewPermissions: [],
          graphs: {
            connect: [{ id: graph1.id }, { id: graph2.id }]
          },
          userCreatedId: user.userId,
          organizationId: orgId
        }
      });

      await prisma.graph_Collection.create({
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

      const result = await StatisticsService.getAllGraphCollections(user, organization);
      expect(result[0].userCreated.userId).toBe(user.userId);
      expect(result.length).toBe(1);
      expect(
        result.map((graphCol) => {
          return graphCol.id;
        })
      ).toEqual([graphCollection1.id]);
    });

    it('Succeeds and gets all the graphs the user has permission to see with permissions', async () => {
      user = await createTestUser({ ...batmanAppAdmin, permissions: [Special_Permission.FINANCE_ONLY] }, orgId);
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
          viewPermissions: [],
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

      const result = await StatisticsService.getAllGraphCollections(user, organization);
      expect(result[0].userCreated.userId).toBe(user.userId);
      expect(result.length).toBe(2);
      expect(
        result.map((graphCol) => {
          return graphCol.id;
        })
      ).toEqual([graphCollection1.id, graphCollection2.id]);
    });
  });

  describe('Edit Graph', () => {
    it('Edit graph correctly updates startDate, endDate, title, and graphType', async () => {
      const updatedStartDate = new Date('12/13/2024');
      const updatedEndDate = new Date(updatedStartDate.getTime() + 10000);
      const updatedTitle = 'Updated Graph';
      const updatedGraphType = Graph_Type.PROJECT_BUDGET_BY_PROJECT;
      const updatedMeasure = Measure.AVG;
      const updatedGraphDisplayType = Graph_Display_Type.PIE;
      const car = await createTestCar(organization.organizationId, user.userId);

      const updatedGraph = await StatisticsService.editGraph(
        user,
        graph.graphId,
        updatedTitle,
        updatedGraphType,
        updatedMeasure,
        updatedGraphDisplayType,
        organization,
        [car.carId],
        ['FINANCE_ONLY'],
        updatedStartDate,
        updatedEndDate
      );

      expect(updatedGraph.startDate).toStrictEqual(updatedStartDate);
      expect(updatedGraph.endDate).toStrictEqual(updatedEndDate);
      expect(updatedGraph.title).toStrictEqual(updatedTitle);
      expect(updatedGraph.graphType).toStrictEqual(updatedGraphType);
      expect(updatedGraph.carIds).toStrictEqual([car.carId]);
      expect(updatedGraph.graphDisplayType).toStrictEqual(updatedGraphDisplayType);
      expect(updatedGraph.specialPermissions).toStrictEqual(['FINANCE_ONLY']);
      expect(updatedGraph.measure).toStrictEqual(updatedGraph.measure);
    });

    it('Edit graph fails if the graph id is invalid', async () => {
      const invalidGraphId = 'foobar';
      await expect(
        async () =>
          await StatisticsService.editGraph(
            user,
            invalidGraphId,
            'New Graph',
            Graph_Type.PROJECT_BUDGET_BY_DIVISION,
            Measure.SUM,
            Graph_Display_Type.BAR,
            organization,
            [],
            []
          )
      ).rejects.toThrow(new NotFoundException('Graph', invalidGraphId));
    });

    it('Edit graph fails if editing user does not have edit graph permissions', async () => {
      const userEditing = await createTestUser(theVisitorGuest, orgId);
      await expect(
        async () =>
          await StatisticsService.editGraph(
            userEditing,
            graph.graphId,
            'New Graph',
            Graph_Type.PROJECT_BUDGET_BY_DIVISION,
            Measure.SUM,
            Graph_Display_Type.BAR,
            organization,
            [],
            []
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permission to edit a graph'));
    });

    it('Edit graph fails if graph is deleted', async () => {
      // Todo - Implement deleting graphs before testing for this
    });

    it('Throws if end date is before start date', async () => {
      await expect(
        async () =>
          await StatisticsService.editGraph(
            user,
            graph.graphId,
            'New Graph',
            Graph_Type.PROJECT_BUDGET_BY_DIVISION,
            Measure.SUM,
            Graph_Display_Type.BAR,
            organization,
            [],
            [],
            new Date(),
            new Date(new Date().getTime() - 10000)
          )
      ).rejects.toThrow(new HttpException(400, 'End date must be after start date'));
    });
  });
});
