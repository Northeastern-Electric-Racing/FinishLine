import { Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import { WorkPackageSelection } from 'shared';
import { HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestTeam,
  createTestTeamType,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
import { aquamanLeadership, flashAdmin, greenlanternHead, supermanAdmin } from '../test-data/users.test-data.js';
import WorkPackagesService from '../../src/services/work-packages.services.js';

describe('Work Package Tests', () => {
  let organization: Organization;
  let orgId: string;
  let user: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  type TestWorkPackage = Awaited<ReturnType<typeof createTestWorkPackage>>;
  const wbs = (workPackageNumber: number) => ({ carNumber: 1, projectNumber: 1, workPackageNumber });
  // makes `blocker` block `blocked`
  const block = (blocker: TestWorkPackage, blocked: TestWorkPackage) =>
    prisma.work_Package.update({
      where: { workPackageId: blocked.workPackageId },
      data: { blockedBy: { connect: { wbsElementId: blocker.wbsElementId } } }
    });
  const setStart = (wp: TestWorkPackage, startDate: Date) =>
    prisma.work_Package.update({ where: { workPackageId: wp.workPackageId }, data: { startDate } });

  describe('getManyWorkPackages', () => {
    it('returns all work packages matching the requested WBS numbers', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      const result = await WorkPackagesService.getManyWorkPackages(
        [
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          { carNumber: 1, projectNumber: 1, workPackageNumber: 2 }
        ],
        organization
      );

      expect(result).toHaveLength(2);
      const wpNumbers = result.map((wp) => wp.wbsNum.workPackageNumber).sort((a, b) => a - b);
      expect(wpNumbers).toEqual([1, 2]);
    });
  });

  describe('getBlockingWorkPackages', () => {
    it('returns work packages that are blocked by the given work package', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      await prisma.work_Package.update({
        where: { workPackageId: wpB.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });

      const result = await WorkPackagesService.getBlockingWorkPackages(
        { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
        organization
      );

      expect(result).toHaveLength(1);
      expect(result[0].wbsNum).toEqual({ carNumber: 1, projectNumber: 1, workPackageNumber: 2 });
    });

    it('follows the blocking chain transitively', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      const wpC = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 3);
      await block(wpA, wpB);
      await block(wpB, wpC);

      const result = await WorkPackagesService.getBlockingWorkPackages(wbs(1), organization);

      expect(result.map((wp) => wp.wbsNum.workPackageNumber).sort()).toEqual([2, 3]);
    });

    it('skips deleted work packages and does not walk past them', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      const wpC = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 3);
      await block(wpA, wpB);
      await block(wpB, wpC);
      await prisma.wBS_Element.update({ where: { wbsElementId: wpB.wbsElementId }, data: { dateDeleted: new Date() } });

      const result = await WorkPackagesService.getBlockingWorkPackages(wbs(1), organization);

      expect(result).toHaveLength(0);
    });

    it('throws when the blocking chain loops back to the starting work package', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      await block(wpA, wpB);
      await block(wpB, wpA);

      await expect(WorkPackagesService.getBlockingWorkPackages(wbs(1), organization)).rejects.toThrow(HttpException);
    });
  });

  describe('getSingleWorkPackage', () => {
    it('returns the work package from the requesting organization when another org has the same wbs number', async () => {
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other org', description: '', applicationLink: '', userCreated: { connect: { userId: user.userId } } }
      });
      const otherCar = await createTestCar(otherOrg.organizationId, user.userId, 1);
      const otherProj = await createTestProject(user, otherOrg.organizationId, undefined, otherCar.carId, 1, 1);
      await createTestWorkPackage(user, otherOrg.organizationId, otherProj.projectId, 1, 1, 1);

      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const ours = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);

      const result = await WorkPackagesService.getSingleWorkPackage(wbs(1), organization);

      expect(result.id).toEqual(ours.workPackageId);
    });

    it('names its blockers', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      await block(wpA, wpB);

      const result = await WorkPackagesService.getSingleWorkPackage(wbs(2), organization);

      expect(result.blockedBy).toEqual([{ wbsNum: wbs(1), name: 'WP 1.1.1' }]);
    });
  });

  describe('editWorkPackage', () => {
    it('records the lead and manager changes against the right fields', async () => {
      const manager = await createTestUser(aquamanLeadership, orgId);
      const newLead = await createTestUser(flashAdmin, orgId);
      const newManager = await createTestUser(greenlanternHead, orgId);
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wp = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      // lead and manager start out as different people so a swap would show up in the change log
      await prisma.wBS_Element.update({ where: { wbsElementId: wp.wbsElementId }, data: { managerId: manager.userId } });
      const cr = await prisma.change_Request.create({
        data: {
          identifier: 1,
          submitterId: user.userId,
          organizationId: orgId,
          wbsElementId: wp.wbsElementId,
          type: 'STANDARD',
          accepted: true,
          dateReviewed: new Date(),
          reviewerId: user.userId
        }
      });

      await WorkPackagesService.editWorkPackage(
        user,
        wp.workPackageId,
        wp.wbsElement.name,
        cr.crId,
        null,
        '2024-01-01',
        4,
        [],
        [],
        newLead.userId,
        newManager.userId,
        organization
      );

      const changes = await prisma.change.findMany({ where: { changeRequestId: cr.crId }, select: { detail: true } });
      const details = changes.map((change) => change.detail);
      expect(details).toContain('Changed lead from "Clark Kent" to "Barry Allen"');
      expect(details).toContain('Changed manager from "Arthur Curry" to "Hal Jordan"');
    });
  });

  describe('getHomePageWorkPackages', () => {
    const weeksFromNow = (weeks: number) => new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);

    it('only returns overdue work packages for ALL_OVERDUE, with their blockers named', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      // starts 2024-01-01 for 4 weeks, so long overdue
      const overdue = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const inProgress = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      const future = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 3);
      await setStart(inProgress, weeksFromNow(-1));
      await setStart(future, weeksFromNow(8));
      await block(inProgress, overdue);

      const result = await WorkPackagesService.getHomePageWorkPackages(user, organization, WorkPackageSelection.ALL_OVERDUE);

      expect(result.map((wp) => wp.id)).toEqual([overdue.workPackageId]);
      expect(result[0].blockedBy).toEqual([{ wbsNum: wbs(2), name: 'WP 1.1.2', projectName: 'Genesis' }]);
    });

    it('leaves out work packages starting more than two weeks out for LEADING', async () => {
      // createTestTeam would make its own team type in a brand new org, so hand it one in ours
      const teamType = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(user.userId, teamType.teamTypeId, orgId);
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, team.teamId, car1.carId, 1, 1);
      const upcoming = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const later = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      await setStart(upcoming, weeksFromNow(1));
      await setStart(later, weeksFromNow(8));

      const result = await WorkPackagesService.getHomePageWorkPackages(user, organization, WorkPackageSelection.LEADING);

      expect(result.map((wp) => wp.id)).toEqual([upcoming.workPackageId]);
    });
  });

  describe('getWorkPackagesByProject', () => {
    it('successfully returns work packages for a project', async () => {
      const car = await createTestCar(orgId, user.userId);
      const project = await createTestProject(user, orgId, undefined, car.carId);

      await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'WP 1',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId: orgId
            }
          },
          project: { connect: { projectId: project.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      const workPackages = await WorkPackagesService.getWorkPackagesByProject(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId: orgId } as any
      );

      expect(workPackages.length).toBe(1);
    });

    it('returns empty array when project has no work packages', async () => {
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, undefined, car.carId);

      const workPackages = await WorkPackagesService.getWorkPackagesByProject(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId: orgId } as any
      );

      expect(workPackages.length).toBe(0);
    });

    it('throws NotFoundException when project does not exist', async () => {
      await expect(async () =>
        WorkPackagesService.getWorkPackagesByProject({ carNumber: 99, projectNumber: 99, workPackageNumber: 0 }, {
          organizationId: orgId
        } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
