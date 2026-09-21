import { Car, Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import ExecSummaryServices from '../../src/services/exec-summaries.services.js';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { createTestCar, createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { member, supermanAdmin } from '../test-data/users.test-data.js';
import { executiveSummaryTransformer } from '../../src/transformers/executive-summary.transformer.js';
import { getExecutiveSummaryQueryArgs } from '../../src/prisma-query-args/executive-summary.query-args.js';

describe('Executive Summaries Tests', () => {
  let organization: Organization;
  let orgId: string;
  let superman: User;
  let car: Car;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    superman = await createTestUser(supermanAdmin, orgId);
    car = await createTestCar(orgId, superman.userId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get single executive summary', () => {
    it('successful get single exec summary', async () => {
      const createdSummary = await prisma.executive_Summary.create({
        data: {
          carId: car.carId,
          userCreatedId: superman.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const summary = await ExecSummaryServices.getSingleExecutiveSummary(
        organization,
        createdSummary.executiveSummaryId,
        superman
      );
      expect(summary).toStrictEqual(executiveSummaryTransformer(createdSummary));
    });
    it('invalid id get single exec summary', async () => {
      await expect(async () =>
        ExecSummaryServices.getSingleExecutiveSummary(organization, 'badid', superman)
      ).rejects.toThrow(new NotFoundException('Executive Summary', 'badid'));
    });
  });

  describe('Create Executive Summary', () => {
    it('Successfully creates an executive summary', async () => {
      const summary = await ExecSummaryServices.createExecutiveSummary(
        superman,
        organization,
        car.carId,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-06-01T00:00:00.000Z'),
        'test goals',
        'test wins',
        'test budget notes',
        'test recruitment notes'
      );

      expect(summary.car.name).toBe('Car');
      expect(summary.goals).toBe('test goals');
      expect(summary.winsAndImprovements).toBe('test wins');
      expect(summary.budgetNotes).toBe('test budget notes');
      expect(summary.recruitmentNotes).toBe('test recruitment notes');
      expect(summary.seasonStartDate).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(summary.seasonEndDate).toEqual(new Date('2026-06-01T00:00:00.000Z'));
      expect(summary.userCreated.userId).toBe(superman.userId);
      expect(summary.dateDeleted).toBeUndefined();
      expect(summary.competitionPerformances).toHaveLength(0);
      expect(summary.competitionDocumentsSummary).toBeUndefined();
      expect(summary.recruitmentCycles).toHaveLength(0);
    });

    it('Defaults the note fields to empty strings when they are omitted', async () => {
      const summary = await ExecSummaryServices.createExecutiveSummary(superman, organization, car.carId);

      expect(summary.goals).toBe('');
      expect(summary.winsAndImprovements).toBe('');
      expect(summary.budgetNotes).toBe('');
      expect(summary.recruitmentNotes).toBe('');
      expect(summary.seasonStartDate).toBeUndefined();
      expect(summary.seasonEndDate).toBeUndefined();
    });

    it('Fails when a non admin tries to create an executive summary', async () => {
      await expect(
        async () =>
          await ExecSummaryServices.createExecutiveSummary(
            await createTestUser(member, orgId),
            organization,
            car.carId,
            undefined,
            undefined,
            'test goals'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create an executive summary'));
    });

    it('Fails when the car does not exist', async () => {
      await expect(
        async () => await ExecSummaryServices.createExecutiveSummary(superman, organization, 'badid')
      ).rejects.toThrow(new NotFoundException('Car', 'badid'));
    });

    it('Fails when the car belongs to a different organization', async () => {
      const otherOrganization = await prisma.organization.create({
        data: {
          name: 'Other Org (exec summary test)',
          description: 'for cross-org negative case',
          applicationLink: '',
          userCreated: { connect: { userId: superman.userId } }
        }
      });
      const otherOrgCar = await createTestCar(otherOrganization.organizationId, superman.userId, 1);

      await expect(
        async () => await ExecSummaryServices.createExecutiveSummary(superman, organization, otherOrgCar.carId)
      ).rejects.toThrow(new NotFoundException('Car', otherOrgCar.carId));
    });

    it('Fails when the car already has an executive summary', async () => {
      await ExecSummaryServices.createExecutiveSummary(superman, organization, car.carId);

      await expect(
        async () => await ExecSummaryServices.createExecutiveSummary(superman, organization, car.carId)
      ).rejects.toThrow(new HttpException(400, 'This car already has an executive summary'));
    });

    it('Fails when the season start date is after the season end date', async () => {
      await expect(
        async () =>
          await ExecSummaryServices.createExecutiveSummary(
            superman,
            organization,
            car.carId,
            new Date('2026-06-01T00:00:00.000Z'),
            new Date('2026-01-01T00:00:00.000Z')
          )
      ).rejects.toThrow(new HttpException(400, 'Season start date must not be after season end date'));
    });
  });
});
