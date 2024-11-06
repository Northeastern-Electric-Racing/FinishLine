import { Organization } from '@prisma/client';
import { supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import StatisticsService from '../../src/services/statistics.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { GraphDataUnit, GraphType, Measure } from 'shared';

describe('Statistics Tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
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
            new Date(),
            'Graph 1',
            GraphType.LINE,
            [
              {
                id: '1',
                type: GraphDataUnit.CHANGE_REQUEST,
                measure: Measure.SUM,
                value: 1,
                graphId: '1'
              }
            ],
            GraphDataUnit.CHANGE_REQUEST,
            'fake-link-id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permission to create a graph'));
    });

    it('Create graph works', async () => {
      const result = await StatisticsService.createGraph(
        await createTestUser(supermanAdmin, orgId),
        new Date(),
        new Date(),
        'Graph 2',
        GraphType.LINE,
        [
          {
            id: '1',
            type: GraphDataUnit.CHANGE_REQUEST,
            measure: Measure.SUM,
            value: 1,
            graphId: '1'
          }
        ],
        GraphDataUnit.CHANGE_REQUEST,
        'fake-link-id',
        organization
      );

      expect(result).toEqual({
        title: 'Graph 2',
        graphType: 'LINE',
        data: {
          id: '1',
          type: GraphDataUnit.CHANGE_REQUEST,
          measure: Measure.SUM
        },
        groupBy: 'CHANGE_REQUEST',
        graphCollectionLinkId: 'fake-link-id'
      });
    });
  });
});
