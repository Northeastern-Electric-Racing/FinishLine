/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Car, Organization, Prisma, User } from '@prisma/client';
import ExecSummaryServices from '../../src/services/exec-summaries.services.js';
import { executiveSummaryTransformer } from '../../src/transformers/executive-summary.transformer.js';
import {
  AccessDeniedException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';
import {
  getBaseCompetitionDocumentsSummaryQueryArgs,
  getBaseCompetitionPerformanceQueryArgs,
  getBaseExecutiveSummaryQueryArgs,
  getBaseRecruitmentCycleQueryArgs,
  getBaseRecruitmentDivisionCountQueryArgs
} from '../../src/prisma-query-args/executive-summary.query-args.js';
import { getUserQueryArgs } from '../../src/prisma-query-args/user.query-args.js';
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
  createTestCompetitionPerformance,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin, member, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data.js';

// the same fields the service selects when returning a full executive summary
const getExecutiveSummaryDetailQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Executive_SummaryDefaultArgs>()({
    select: {
      ...getBaseExecutiveSummaryQueryArgs().select,
      goals: true,
      winsAndImprovements: true,
      budgetNotes: true,
      recruitmentNotes: true,
      userCreated: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      competitionPerformances: getBaseCompetitionPerformanceQueryArgs(),
      competitionDocumentsSummary: getBaseCompetitionDocumentsSummaryQueryArgs(),
      recruitmentCycles: {
        orderBy: { term: 'asc' },
        select: {
          ...getBaseRecruitmentCycleQueryArgs().select,
          divisionCounts: getBaseRecruitmentDivisionCountQueryArgs()
        }
      }
    }
  });

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
        ...getExecutiveSummaryDetailQueryArgs(organization.organizationId)
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
        ...getExecutiveSummaryDetailQueryArgs(organization.organizationId)
      });

      const car2 = await createTestCar(organization.organizationId, superman.userId, 1);

      const createdSummary2 = await prisma.executive_Summary.create({
        data: {
          carId: car2.carId,
          userCreatedId: superman.userId
        },
        ...getExecutiveSummaryDetailQueryArgs(organization.organizationId)
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

  describe('Get budget summary', () => {
    it('fails if the viewer is a guest', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);

      await expect(async () =>
        ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, guestUser)
      ).rejects.toThrow(new AccessDeniedException('Only members can view executive summaries'));
    });

    it('fails if the executive summary does not exist', async () => {
      await expect(async () => ExecSummaryServices.getBudgetSummary(organization, 'badid', superman)).rejects.toThrow(
        new NotFoundException('Executive Summary', 'badid')
      );
    });

    it('fails if the executive summary was deleted', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      await prisma.executive_Summary.update({
        where: { executiveSummaryId: summary.executiveSummaryId },
        data: { dateDeleted: new Date() }
      });

      await expect(async () =>
        ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman)
      ).rejects.toThrow(new DeletedException('Executive Summary', summary.executiveSummaryId));
    });

    const getDivisionValue = (result: Awaited<ReturnType<typeof ExecSummaryServices.getBudgetSummary>>, label: string) =>
      result.budgetByDivision.values.find((v) => v.label === label)?.value;

    it('returns the budget totaled by division for the car', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(result.executiveSummaryId).toBe(summary.executiveSummaryId);
      expect(getDivisionValue(result, 'aTeam')).toBe(project.budget);
      expect(getDivisionValue(result, 'Unassigned')).toBeUndefined();
    });

    it('excludes projects whose work is outside the season', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      await prisma.executive_Summary.update({
        where: { executiveSummaryId: summary.executiveSummaryId },
        data: { seasonStartDate: new Date('2025-01-01'), seasonEndDate: new Date('2025-06-01') }
      });
      const project = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(getDivisionValue(result, 'aTeam')).toBe(0);
    });

    it('does not double count a project on multiple teams in the same division', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const team1 = await createTestTeam(superman.userId, teamTypeId, orgId);
      const team2 = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, team1.teamId, car.carId, 0, 1);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: { teams: { connect: { teamId: team2.teamId } } }
      });
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(getDivisionValue(result, 'aTeam')).toBe(project.budget);
    });

    it('splits a project budget evenly across the divisions of its teams', async () => {
      const { teamTypeId: mechId } = await createTestTeamType('Mechanical', orgId);
      const { teamTypeId: elecId } = await createTestTeamType('Electrical', orgId);
      const mechTeam = await createTestTeam(superman.userId, mechId, orgId);
      const elecTeam = await createTestTeam(superman.userId, elecId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, mechTeam.teamId, car.carId, 0, 1);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: { teams: { connect: { teamId: elecTeam.teamId } } }
      });
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(getDivisionValue(result, 'Mechanical')).toBe(project.budget / 2);
      expect(getDivisionValue(result, 'Electrical')).toBe(project.budget / 2);
    });

    it('reports projects without an active team as unassigned', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const archivedTeam = await createTestTeam(superman.userId, teamTypeId, orgId);
      await prisma.team.update({ where: { teamId: archivedTeam.teamId }, data: { dateArchived: new Date() } });
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const noTeamProject = await createTestProject(superman, orgId, undefined, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, noTeamProject.projectId, 0, 1, 1);
      const archivedTeamProject = await createTestProject(superman, orgId, archivedTeam.teamId, car.carId, 0, 2);
      await createTestWorkPackage(superman, orgId, archivedTeamProject.projectId, 0, 2, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(getDivisionValue(result, 'aTeam')).toBe(0);
      expect(getDivisionValue(result, 'Unassigned')).toBe(noTeamProject.budget + archivedTeamProject.budget);
    });

    // records a reimbursed product (cost in cents) charged to the given wbs element
    const addReimbursedSpend = async (wbsElementId: string, costInCents: number) => {
      const [vendor, indexCode, accountCode] = await Promise.all([
        prisma.vendor.create({
          data: { name: `vendor-${Math.random()}`, organizationId: orgId, addedByUserId: superman.userId }
        }),
        prisma.index_Code.create({
          data: { name: 'idx', code: '1', userCreatedId: superman.userId, organizationId: orgId }
        }),
        prisma.account_Code.create({
          data: { name: `acct-${Math.random()}`, code: 1, allowed: true, organizationId: orgId }
        })
      ]);
      const request = await prisma.reimbursement_Request.create({
        data: {
          identifier: Math.floor(Math.random() * 1_000_000),
          recipientId: superman.userId,
          vendorId: vendor.vendorId,
          indexCodeId: indexCode.indexCodeId,
          accountCodeId: accountCode.accountCodeId,
          organizationId: orgId,
          totalCost: costInCents,
          reimbursementStatuses: { create: { type: 'REIMBURSED', userId: superman.userId } }
        }
      });
      const reason = await prisma.reimbursement_Product_Reason.create({ data: { wbsElementId } });
      await prisma.reimbursement_Product.create({
        data: {
          cost: costInCents,
          reimbursementProductReasonId: reason.reimbursementProductReasonId,
          reimbursementRequestId: request.reimbursementRequestId
        }
      });
    };

    it('counts spending charged to a work package toward its project and division', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      const workPackage = await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);
      await addReimbursedSpend(project.wbsElementId, 10000);
      await addReimbursedSpend(workPackage.wbsElementId, 25000);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(result.totalSpent).toBe(350);
      expect(result.mostExpensiveDivision).toEqual({ label: 'aTeam', amount: 350 });
    });

    it('includes unassigned spending in the totals and highlights', async () => {
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, undefined, car.carId, 0, 1);
      await prisma.project.update({ where: { projectId: project.projectId }, data: { budget: 0 } });
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);
      await addReimbursedSpend(project.wbsElementId, 50000);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(getDivisionValue(result, 'Unassigned')).toBe(0);
      expect(result.totalSpent).toBe(500);
      expect(result.totalBudget).toBe(0);
      expect(result.mostExpensiveDivision).toEqual({ label: 'Unassigned', amount: 500 });
      expect(result.mostOverbudgetDivision).toEqual({ label: 'Unassigned', amount: 500 });
      expect(result.mostOverbudgetProject?.amount).toBe(500);
    });

    it('does not flag a division as overbudget because of rounding when a project is split three ways', async () => {
      const teams = await Promise.all(
        ['A', 'B', 'C'].map(async (name) => {
          const { teamTypeId } = await createTestTeamType(name, orgId);
          return createTestTeam(superman.userId, teamTypeId, orgId);
        })
      );
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, teams[0].teamId, car.carId, 0, 1);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: { budget: 100, teams: { connect: teams.slice(1).map((t) => ({ teamId: t.teamId })) } }
      });
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);
      await addReimbursedSpend(project.wbsElementId, 10000);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(result.mostOverbudgetDivision).toBeUndefined();
      expect(result.mostOverbudgetProject).toBeUndefined();
      expect(result.totalSpent).toBe(100);
    });

    it('returns totals and no highlights when nothing has been spent', async () => {
      const { teamTypeId } = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(superman.userId, teamTypeId, orgId);
      const summary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const project = await createTestProject(superman, orgId, team.teamId, car.carId, 0, 1);
      await createTestWorkPackage(superman, orgId, project.projectId, 0, 1, 1);

      const result = await ExecSummaryServices.getBudgetSummary(organization, summary.executiveSummaryId, superman);

      expect(result.totalBudget).toBe(project.budget);
      expect(result.totalSpent).toBe(0);
      expect(result.mostExpensiveDivision).toBeUndefined();
      expect(result.mostOverbudgetDivision).toBeUndefined();
      expect(result.mostOverbudgetProject).toBeUndefined();
    });
  });

  describe('Edit Competition Performance', () => {
    it('Fails if the user is not an admin and not on the ops team', async () => {
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const competitionPerformance = await createTestCompetitionPerformance(executiveSummary.executiveSummaryId);
      const nonAdminMember = await createTestUser(member, orgId);

      await expect(
        async () =>
          await ExecSummaryServices.editCompetitionPerformance(
            nonAdminMember,
            organization,
            1,
            500,
            600,
            'Acceleration',
            'Skidpad',
            'Autocross',
            'Endurance',
            4,
            50,
            20,
            22,
            95,
            competitionPerformance.competitionPerformanceId
          )
      ).rejects.toThrow(new AccessDeniedException('edit a competition performance'));
    });

    it('Fails if the competition performance does not exist', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        async () =>
          await ExecSummaryServices.editCompetitionPerformance(
            admin,
            organization,
            1,
            500,
            600,
            'Acceleration',
            'Skidpad',
            'Autocross',
            'Endurance',
            4,
            50,
            20,
            22,
            95,
            'nonexistent-id'
          )
      ).rejects.toThrow(new NotFoundException('Competition Performance', 'nonexistent-id'));
    });

    it('Fails if the competition performance belongs to a different organization', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      // createTestOrganization() always uses the same googleAuthId, so it can't be called a second
      // time in this test (the outer beforeEach already called it once). The organization/car/exec
      // summary FKs just need a valid existing userId, with no requirement that the user actually
      // hold a role in that specific organization, so reuse the already-created superman user
      // (no new User row is created at all, so there's nothing to collide).
      const dummyOrganization = await prisma.organization.create({
        data: {
          name: 'Dummy Org',
          description: 'Dummy org for cross-organization test',
          applicationLink: '',
          userCreated: { connect: { userId: superman.userId } }
        }
      });
      const dummyOrgCar = await createTestCar(dummyOrganization.organizationId, superman.userId);
      const otherOrgExecutiveSummary = await createTestExecutiveSummary(
        dummyOrganization,
        dummyOrgCar.carId,
        superman.userId
      );
      const otherOrgCompetitionPerformance = await createTestCompetitionPerformance(
        otherOrgExecutiveSummary.executiveSummaryId
      );

      await expect(
        async () =>
          await ExecSummaryServices.editCompetitionPerformance(
            admin,
            organization,
            1,
            500,
            600,
            'Acceleration',
            'Skidpad',
            'Autocross',
            'Endurance',
            4,
            50,
            20,
            22,
            95,
            otherOrgCompetitionPerformance.competitionPerformanceId
          )
      ).rejects.toThrow(new InvalidOrganizationException('Competition Performance'));
    });

    it('Succeeds and edits the competition performance as an admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const competitionPerformance = await createTestCompetitionPerformance(executiveSummary.executiveSummaryId);

      const edited = await ExecSummaryServices.editCompetitionPerformance(
        admin,
        organization,
        1,
        500,
        600,
        'Acceleration',
        'Skidpad',
        'Autocross',
        'Endurance',
        4,
        50,
        20,
        22,
        95,
        competitionPerformance.competitionPerformanceId
      );

      expect(edited.finalPlace).toBe(1);
      expect(edited.totalPointsEarned).toBe(500);
      expect(edited.maxPoints).toBe(600);
      expect(edited.bestStaticEvent).toBe('Acceleration');
      expect(edited.worstStaticEvent).toBe('Skidpad');
      expect(edited.bestDynamicEvent).toBe('Autocross');
      expect(edited.worstDynamicEvent).toBe('Endurance');
      expect(edited.accelerationTopTimeSeconds).toBe(4);
      expect(edited.autocrossTopTimeSeconds).toBe(50);
      expect(edited.enduranceLapsCompleted).toBe(20);
      expect(edited.maxLaps).toBe(22);
      expect(edited.enduranceAvgLapTimeSeconds).toBe(95);
    });

    it('Succeeds and edits the competition performance as an ops team member', async () => {
      const opsMember = await createOpsTeamAndMember(organization);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const competitionPerformance = await createTestCompetitionPerformance(executiveSummary.executiveSummaryId);

      const edited = await ExecSummaryServices.editCompetitionPerformance(
        opsMember,
        organization,
        1,
        500,
        600,
        'Acceleration',
        'Skidpad',
        'Autocross',
        'Endurance',
        4,
        50,
        20,
        22,
        95,
        competitionPerformance.competitionPerformanceId
      );

      expect(edited.finalPlace).toBe(1);
    });

    it('Succeeds clearing optional fields by passing null', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const executiveSummary = await createTestExecutiveSummary(organization, car.carId, superman.userId);
      const competitionPerformance = await createTestCompetitionPerformance(executiveSummary.executiveSummaryId);

      const edited = await ExecSummaryServices.editCompetitionPerformance(
        admin,
        organization,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        competitionPerformance.competitionPerformanceId
      );

      expect(edited.finalPlace).toBeUndefined();
      expect(edited.totalPointsEarned).toBeUndefined();
    });
  });
});
