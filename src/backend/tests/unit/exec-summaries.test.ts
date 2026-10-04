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
  createTestProject,
  createTestWorkPackage,
  createTestTeam,
  createTestTeamType,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin, member, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data.js';

describe('Executive Summary Tests', () => {
  let orgId: string;
  let organization: Organization;
  let superman: User;
  let car: Car;
  let guestUser: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    superman = await createTestUser(supermanAdmin, orgId);
    car = await createTestCar(orgId, superman.userId);
    guestUser = await createTestUser(wonderwomanGuest, orgId);
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

  describe('get all executive summaries', () => {
    it('successful get all exec summaries', async () => {
      const createdSummary1 = await prisma.executive_Summary.create({
        data: {
          carId: car.carId,
          userCreatedId: superman.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const car2 = await createTestCar(organization.organizationId, superman.userId, 1);

      const createdSummary2 = await prisma.executive_Summary.create({
        data: {
          carId: car2.carId,
          userCreatedId: superman.userId
        },
        ...getExecutiveSummaryQueryArgs(organization.organizationId)
      });

      const summaries = await ExecSummaryServices.getAllExecutiveSummaries(organization, superman);
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

  describe('Get vehicle development summary', () => {
    let teamTypeId: string;

    beforeEach(async () => {
      ({ teamTypeId } = await createTestTeamType('aTeam', orgId));
    });

    it('fails if the viewer is a guest', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      await expect(async () =>
        ExecSummaryServices.getVehicleDevelopmentSummary(organization, summary.executiveSummaryId, guestUser)
      ).rejects.toThrow(new AccessDeniedException('Only members can view executive summaries'));
    });

    it('fails if the executive summary does not exist', async () => {
      await expect(async () =>
        ExecSummaryServices.getVehicleDevelopmentSummary(organization, 'badid', superman)
      ).rejects.toThrow(new NotFoundException('Executive Summary', 'badid'));
    });

    it('fails if the executive summary was deleted', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      await prisma.executive_Summary.update({
        where: { executiveSummaryId: summary.executiveSummaryId },
        data: { dateDeleted: new Date() }
      });

      await expect(async () =>
        ExecSummaryServices.getVehicleDevelopmentSummary(organization, summary.executiveSummaryId, superman)
      ).rejects.toThrow(new DeletedException('Executive Summary', summary.executiveSummaryId));
    });

    it('returns projects within the season with their team and dates', async () => {
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getVehicleDevelopmentSummary(
        organization,
        summary.executiveSummaryId,
        superman
      );

      expect(result.executiveSummaryId).toBe(summary.executiveSummaryId);
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].wbsElementId).toBe(project.wbsElementId);
      expect(result.projects[0].teams.map((t) => t.teamId)).toEqual([team.teamId]);
      expect(result.projects[0].startDate).toEqual(new Date('2024-01-01'));
      expect(result.projects[0].plannedEndDate).toEqual(new Date('2024-01-29'));
    });

    it('excludes projects outside the season, deleted projects, and other cars', async () => {
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      await prisma.executive_Summary.update({
        where: { executiveSummaryId: summary.executiveSummaryId },
        data: { seasonStartDate: new Date('2025-01-01'), seasonEndDate: new Date('2025-06-01') }
      });

      // work package from createTestWorkPackage runs Jan 2024, before the 2025 season
      const outOfSeason = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, outOfSeason.projectId, 0, 1, 1);

      const inSeason = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 2);
      await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 2,
              workPackageNumber: 1,
              name: 'In season WP',
              leadId: superman.userId,
              managerId: superman.userId,
              organizationId: orgId
            }
          },
          project: { connect: { projectId: inSeason.projectId } },
          startDate: new Date('2025-02-01'),
          duration: 4,
          orderInProject: 1
        }
      });

      const deletedProject = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 3, new Date());
      await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 3,
              workPackageNumber: 1,
              name: 'Deleted project WP',
              leadId: superman.userId,
              managerId: superman.userId,
              organizationId: orgId
            }
          },
          project: { connect: { projectId: deletedProject.projectId } },
          startDate: new Date('2025-02-01'),
          duration: 4,
          orderInProject: 1
        }
      });

      const result = await ExecSummaryServices.getVehicleDevelopmentSummary(
        organization,
        summary.executiveSummaryId,
        superman
      );

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].wbsElementId).toBe(inSeason.wbsElementId);
    });

    it('fails if the team does not exist', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      await expect(async () =>
        ExecSummaryServices.getVehicleDevelopmentSummary(organization, summary.executiveSummaryId, superman, 'badid')
      ).rejects.toThrow(new NotFoundException('Team', 'badid'));
    });

    it('filters by team when a team id is provided', async () => {
      const team1 = await createTestTeam(superman.userId, teamTypeId, orgId);
      const team2 = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      const project1 = await createTestProject(superman, orgId, team1.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, project1.projectId, 0, 1, 1);
      const project2 = await createTestProject(superman, orgId, team2.teamId, car.carId, 0, 2);
      await createTestWorkPackage(superman, orgId, project2.projectId, 0, 2, 1);

      const all = await ExecSummaryServices.getVehicleDevelopmentSummary(organization, summary.executiveSummaryId, superman);
      expect(all.projects).toHaveLength(2);

      const filtered = await ExecSummaryServices.getVehicleDevelopmentSummary(
        organization,
        summary.executiveSummaryId,
        superman,
        team1.teamId
      );
      expect(filtered.projects).toHaveLength(1);
      expect(filtered.projects[0].wbsElementId).toBe(project1.wbsElementId);
      expect(filtered.projects[0].teams.map((t) => t.teamId)).toContain(team1.teamId);
    });
  });
});
