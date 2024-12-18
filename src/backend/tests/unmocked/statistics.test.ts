import { Graph_Type, Organization, User } from '@prisma/client';
import { supermanAdmin, theVisitorGuest, wonderwomanGuest } from '../test-data/users.test-data';
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
import { Graph, GraphGen, GraphType, Measure } from 'shared';

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
  let graph: Graph;

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
    graph = await StatisticsService.createGraph(
      user,
      new Date(),
      new Date(new Date().getTime() + 10000),
      'New Graph',
      Graph_Type.BAR,
      Measure.SUM,
      graphGen,
      organization
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

  describe('Edit Graph', () => {
    it('Edit graph correctly updates startDate, endDate, title, and graphType', async () => {
      const updatedStartDate = new Date('12/13/2024');
      const updatedEndDate = new Date(updatedStartDate.getTime() + 10000);
      const updatedTitle = 'Updated Graph';
      const updatedGraphType = Graph_Type.LINE;
      const updatedMeasure = Measure.AVG;

      const updatedGraph = await StatisticsService.editGraph(
        user,
        graph.id,
        updatedStartDate,
        updatedEndDate,
        updatedTitle,
        updatedGraphType,
        updatedMeasure,
        graphGen,
        organization
      );

      expect(updatedGraph.startDate).toStrictEqual(updatedStartDate);
      expect(updatedGraph.endDate).toStrictEqual(updatedEndDate);
      expect(updatedGraph.title).toStrictEqual(updatedTitle);
      expect(updatedGraph.graphType).toStrictEqual(updatedGraphType);
      // Todo - Assert `editGraph` correctly updates `measure`
      // `measure` is not a property of the shared Graph type. We would have to add it to make the assertion
    });

    it('Edit graph fails if the graph id is invalid', async () => {
      const invalidGraphId = 'foobar';
      await expect(
        async () =>
          await StatisticsService.editGraph(
            user,
            invalidGraphId,
            new Date(),
            new Date(new Date().getTime() + 10000),
            'New Graph',
            Graph_Type.BAR,
            Measure.SUM,
            graphGen,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Graph', invalidGraphId));
    });

    it('Edit graph fails if editing user did not created graph', async () => {
      // `graph` was created by `user`
      // We try to edit `graph` using a user that isn't `user`
      const userEditing = await createTestUser(theVisitorGuest, orgId);
      await expect(
        async () =>
          await StatisticsService.editGraph(
            userEditing,
            graph.id,
            new Date(),
            new Date(new Date().getTime() + 10000),
            'New Graph',
            Graph_Type.BAR,
            Measure.SUM,
            graphGen,
            organization
          )
      ).rejects.toThrow(new AccessDeniedException('Only the creator of an graph can update it'));
    });

    it('Edit graph fails if graph is deleted', async () => {
      // Todo - Implement deleting graphs before testing for this
    });

    it('Throws if end date is before start date', async () => {
      await expect(
        async () =>
          await StatisticsService.editGraph(
            user,
            graph.id,
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
  });
});
