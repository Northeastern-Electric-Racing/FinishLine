/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Car, Organization, User } from '@prisma/client';
import ExecSummaryServices from '../../src/services/exec-summaries.services.js';
import { executiveSummaryTransformer } from '../../src/transformers/executive-summary.transformer.js';
import { getExecutiveSummaryQueryArgs } from '../../src/prisma-query-args/executive-summary.query-args.js';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';
import {
  createTestCar,
  createTestOrganization,
  createTestUser,
  createOpsTeamAndMember,
  createTestExecutiveSummary,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin, member, supermanAdmin } from '../test-data/users.test-data.js';

describe('Executive Summary Tests', () => {
  let orgId: string;
  let organization: Organization;
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

  describe('Edit Executive Summary', () => {
    it('Fails if the user is not an admin and not on the ops team', async () => {
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const nonAdminMember = await createTestUser(member, orgId);

      await expect(
        async () =>
          await ExecSummaryServices.editExecutiveSummary(
            nonAdminMember,
            organization,
            'new goals',
            'new wins',
            'new budget notes',
            'new recruitment notes',
            new Date('01/01/2025'),
            new Date('06/01/2025'),
            executiveSummary.executiveSummaryId
          )
      ).rejects.toThrow(new AccessDeniedException('edit an executive summary'));
    });

    it('Fails if the executive summary does not exist', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        async () =>
          await ExecSummaryServices.editExecutiveSummary(
            admin,
            organization,
            'new goals',
            'new wins',
            'new budget notes',
            'new recruitment notes',
            new Date('01/01/2025'),
            new Date('06/01/2025'),
            'nonexistent-id'
          )
      ).rejects.toThrow(new NotFoundException('Executive Summary', 'nonexistent-id'));
    });

    it('Fails if the executive summary has been deleted', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      await prisma.executive_Summary.update({
        where: { executiveSummaryId: executiveSummary.executiveSummaryId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      await expect(
        async () =>
          await ExecSummaryServices.editExecutiveSummary(
            admin,
            organization,
            'new goals',
            'new wins',
            'new budget notes',
            'new recruitment notes',
            new Date('01/01/2025'),
            new Date('06/01/2025'),
            executiveSummary.executiveSummaryId
          )
      ).rejects.toThrow(new DeletedException('Executive Summary', executiveSummary.executiveSummaryId));
    });

    it('Succeeds and edits the executive summary as an admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      const edited = await ExecSummaryServices.editExecutiveSummary(
        admin,
        organization,
        'new goals',
        'new wins',
        'new budget notes',
        'new recruitment notes',
        new Date('01/01/2025'),
        new Date('06/01/2025'),
        executiveSummary.executiveSummaryId
      );

      expect(edited.goals).toBe('new goals');
      expect(edited.winsAndImprovements).toBe('new wins');
      expect(edited.budgetNotes).toBe('new budget notes');
      expect(edited.recruitmentNotes).toBe('new recruitment notes');
      expect(edited.seasonStartDate).toEqual(new Date('01/01/2025'));
      expect(edited.seasonEndDate).toEqual(new Date('06/01/2025'));
    });

    it('Succeeds and edits the executive summary as an ops team member (non-admin)', async () => {
      const opsMember = await createOpsTeamAndMember(organization);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      const edited = await ExecSummaryServices.editExecutiveSummary(
        opsMember,
        organization,
        'new goals',
        'new wins',
        'new budget notes',
        'new recruitment notes',
        new Date('01/01/2025'),
        new Date('06/01/2025'),
        executiveSummary.executiveSummaryId
      );

      expect(edited.goals).toBe('new goals');
    });
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
});
