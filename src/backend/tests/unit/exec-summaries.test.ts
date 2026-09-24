import { createTestCar, createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { Car, Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import { supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data.js';
import ExecSummaryServices from '../../src/services/exec-summaries.services.js';
import { executiveSummaryTransformer } from '../../src/transformers/executive-summary.transformer.js';
import { getExecutiveSummaryQueryArgs } from '../../src/prisma-query-args/executive-summary.query-args.js';
import { AccessDeniedException, NotFoundException } from '../../src/utils/errors.utils.js';

describe('Executive Summaries Tests', () => {
  let organization: Organization;
  let user: User;
  let car: Car;
  let guestUser: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(supermanAdmin, organization.organizationId);
    car = await createTestCar(organization.organizationId, user.userId);
    guestUser = await createTestUser(wonderwomanGuest, organization.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get single executive summary', () => {
    it('successful get single exec summary', async () => {
      const createdSummary = await prisma.executive_Summary.create({
        data: {
          carId: car.carId,
          userCreatedId: user.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const summary = await ExecSummaryServices.getSingleExecutiveSummary(
        organization,
        createdSummary.executiveSummaryId,
        user
      );
      expect(summary).toStrictEqual(executiveSummaryTransformer(createdSummary));
    });
    it('invalid id get single exec summary', async () => {
      await expect(async () => ExecSummaryServices.getSingleExecutiveSummary(organization, 'badid', user)).rejects.toThrow(
        new NotFoundException('Executive Summary', 'badid')
      );
    });
  });

  describe('get all executive summaries', () => {
    it('successful get all exec summaries', async () => {
      const createdSummary1 = await prisma.executive_Summary.create({
        data: {
          carId: car.carId,
          userCreatedId: user.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const car2 = await createTestCar(organization.organizationId, user.userId, 1);

      const createdSummary2 = await prisma.executive_Summary.create({
        data: {
          carId: car2.carId,
          userCreatedId: user.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const summaries = await ExecSummaryServices.getAllExecutiveSummaries(organization, user);
      expect(summaries).toHaveLength(2);
      expect(summaries).toContainEqual(executiveSummaryTransformer(createdSummary1));
      expect(summaries).toContainEqual(executiveSummaryTransformer(createdSummary2));
    });
    it('invalid guest tries to get all exec summaries', async () => {
      await expect(async () => ExecSummaryServices.getAllExecutiveSummaries(organization, guestUser)).rejects.toThrow(
        new AccessDeniedException('Only members can view executive summaries')
      );
    });
  });
});
