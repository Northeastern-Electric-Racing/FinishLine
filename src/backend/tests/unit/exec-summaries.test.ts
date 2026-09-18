import { createTestCar, createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { Car, Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import { supermanAdmin } from '../test-data/users.test-data.js';
import ExecSummaryServices from '../../src/services/exec-summaries.services.js';
import { executiveSummaryTransformer } from '../../src/transformers/executive-summary.transformer.js';
import { getExecutiveSummaryQueryArgs } from '../../src/prisma-query-args/executive-summary.query-args.js';
import { NotFoundException } from '../../src/utils/errors.utils.js';

describe('Executive Summaries Tests', () => {
  let organization: Organization;
  let user: User;
  let car: Car;

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(supermanAdmin, organization.organizationId);
    car = await createTestCar(organization.organizationId, user.userId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get single executive sumamary', () => {
    it('successful get single exec summary', async () => {
      const createdSummary = await prisma.executive_Summary.create({
        data: {
          carId: car.carId,
          userCreatedId: user.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const summary = await ExecSummaryServices.getSingleExecutiveSummary(organization, createdSummary.executiveSummaryId);
      expect(summary).toStrictEqual(executiveSummaryTransformer(createdSummary));
    });
    it('invalid id get single exec summary', async () => {
      await expect(async () => ExecSummaryServices.getSingleExecutiveSummary(organization, 'badid')).rejects.toThrow(
        new NotFoundException('Executive Summary', 'badid')
      );
    });
  });
});
