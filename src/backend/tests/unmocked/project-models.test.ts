import { CR_Type, Organization, User, WBS_Element_Status } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import { WbsElementStatus, WorkPackageStage } from 'shared';
import { NotFoundException } from '../../src/utils/errors.utils.js';
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
import { flashAdmin, supermanAdmin } from '../test-data/users.test-data.js';
import ProjectsService from '../../src/services/projects.services.js';
import RetrospectiveService from '../../src/services/retrospective.services.js';

describe('Project models', () => {
  let organization: Organization;
  let orgId: string;
  let user: User;
  let carId: string;

  const projectWbs = (projectNumber: number) => ({ carNumber: 1, projectNumber, workPackageNumber: 0 });
  const setStatus = (wbsElementId: string, status: WBS_Element_Status) =>
    prisma.wBS_Element.update({ where: { wbsElementId }, data: { status } });

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    ({ carId } = await createTestCar(orgId, user.userId, 1));
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('getAllProjectsGantt', () => {
    test('leaves out complete projects but keeps ones with no work packages', async () => {
      const complete = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const completeWp = await createTestWorkPackage(user, orgId, complete.projectId, 1, 1, 1);
      await setStatus(completeWp.wbsElementId, WBS_Element_Status.COMPLETE);
      const active = await createTestProject(user, orgId, undefined, carId, 1, 2);
      await createTestWorkPackage(user, orgId, active.projectId, 1, 2, 1);
      const empty = await createTestProject(user, orgId, undefined, carId, 1, 3);

      const projects = await ProjectsService.getAllProjectsGantt(organization);

      expect(projects.map((project) => project.id).sort()).toEqual([active.projectId, empty.projectId].sort());
    });

    test("names each work package's dependents and includes the project's tasks", async () => {
      const project = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const first = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);
      const second = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 2);
      await prisma.work_Package.update({
        where: { workPackageId: second.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: first.wbsElementId } } }
      });
      await prisma.task.create({
        data: {
          title: 'Order foam',
          notes: '',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          wbsElementId: project.wbsElementId,
          createdByUserId: user.userId
        }
      });

      const [gantt] = await ProjectsService.getAllProjectsGantt(organization);

      const ganttFirst = gantt.workPackages.find((wp) => wp.id === first.workPackageId);
      expect(ganttFirst?.blocking).toEqual([{ carNumber: 1, projectNumber: 1, workPackageNumber: 2 }]);
      expect(gantt.tasks.map((task) => task.title)).toEqual(['Order foam']);
      expect(gantt.tasks[0].createdBy.userId).toEqual(user.userId);
    });
  });

  describe('getAllProjects', () => {
    test('derives status and dates from the work packages and lists each team type once', async () => {
      const teamType = await createTestTeamType('aTeam', orgId);
      const teamA = await createTestTeam(user.userId, teamType.teamTypeId, orgId);
      const teamB = await createTestTeam(user.userId, teamType.teamTypeId, orgId);
      const project = await createTestProject(user, orgId, teamA.teamId, carId, 1, 1);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: { teams: { connect: { teamId: teamB.teamId } } }
      });
      const wp = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);
      await prisma.work_Package.update({ where: { workPackageId: wp.workPackageId }, data: { stage: 'DESIGN' } });
      await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 2);

      const [listed] = await ProjectsService.getAllProjects(organization);

      expect(listed.status).toEqual(WbsElementStatus.Active);
      expect(listed.numWorkPackages).toEqual(2);
      expect(listed.activeStage).toEqual(WorkPackageStage.Design);
      expect(listed.teamTypes).toEqual([{ teamTypeId: teamType.teamTypeId, name: 'aTeam' }]);
      // both work packages start 2024-01-01 and run 4 weeks
      expect(listed.startDate).toEqual(new Date('2024-01-01'));
      expect(listed.endDate).toEqual(new Date('2024-01-29'));
    });
  });

  describe('getSingleProject', () => {
    test('names blockers and leaves out deleted work packages', async () => {
      const project = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const first = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);
      const second = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 2);
      const deleted = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 3);
      await prisma.wBS_Element.update({ where: { wbsElementId: deleted.wbsElementId }, data: { dateDeleted: new Date() } });
      await prisma.work_Package.update({
        where: { workPackageId: second.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: first.wbsElementId } } }
      });

      const detail = await ProjectsService.getSingleProject(projectWbs(1), user, organization);

      expect(detail.workPackages.map((wp) => wp.id).sort()).toEqual([first.workPackageId, second.workPackageId].sort());
      const detailSecond = detail.workPackages.find((wp) => wp.id === second.workPackageId);
      expect(detailSecond?.blockedBy).toEqual([
        { wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 1 }, name: 'WP 1.1.1' }
      ]);
    });

    test('tells the viewer whether they favorited it and whether they are on its team', async () => {
      const otherUser = await createTestUser(flashAdmin, orgId);
      const teamType = await createTestTeamType('aTeam', orgId);
      const team = await createTestTeam(user.userId, teamType.teamTypeId, orgId);
      await createTestProject(user, orgId, team.teamId, carId, 1, 1);

      await ProjectsService.toggleFavorite(projectWbs(1), user, organization);

      const asHead = await ProjectsService.getSingleProject(projectWbs(1), user, organization);
      expect(asHead.isFavorited).toBe(true);
      expect(asHead.isOnProjectTeam).toBe(true);

      const asOther = await ProjectsService.getSingleProject(projectWbs(1), otherUser, organization);
      expect(asOther.isFavorited).toBe(false);
      expect(asOther.isOnProjectTeam).toBe(false);

      await ProjectsService.toggleFavorite(projectWbs(1), user, organization);
      expect((await ProjectsService.getSingleProject(projectWbs(1), user, organization)).isFavorited).toBe(false);
    });

    test("can't see another organization's project", async () => {
      await createTestProject(user, orgId, undefined, carId, 1, 1);
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other', description: '', applicationLink: '', userCreated: { connect: { userId: user.userId } } }
      });

      await expect(ProjectsService.getSingleProject(projectWbs(1), user, otherOrg)).rejects.toThrow(
        new NotFoundException('Project', '1.1.0')
      );
    });
  });

  describe('getRetrospectiveTimelines', () => {
    const addChange = async (wbsElementId: string, detail: string, dateImplemented: Date) => {
      const changeRequest = await prisma.change_Request.create({
        data: {
          identifier: Math.floor(Math.random() * 1_000_000),
          submitterId: user.userId,
          organizationId: orgId,
          wbsElementId,
          type: CR_Type.STANDARD
        }
      });
      await prisma.change.create({
        data: { changeRequestId: changeRequest.crId, implementerId: user.userId, wbsElementId, detail, dateImplemented }
      });
    };

    test("reads the original schedule from the window's changes, including added durations", async () => {
      const project = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const wp = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);
      await addChange(wp.wbsElementId, 'Added duration "2"', new Date('2024-02-01'));
      await addChange(wp.wbsElementId, 'Changed start date from "2023-12-01" to "2024-01-01"', new Date('2024-02-02'));
      // outside the window, so it doesn't count
      await addChange(wp.wbsElementId, 'Changed duration from "9" to "4"', new Date('2023-06-01'));

      const [retro] = await RetrospectiveService.getRetrospectiveTimelines(orgId, new Date('2024-01-15'));

      expect(retro.workPackages[0].originalDuration).toEqual(2);
      expect(retro.workPackages[0].originalStartDate).toEqual(new Date('2023-12-01'));
      expect(retro.workPackages[0].isBlocked).toBe(false);
    });

    test('leaves out complete and deleted projects', async () => {
      const complete = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const completeWp = await createTestWorkPackage(user, orgId, complete.projectId, 1, 1, 1);
      await setStatus(completeWp.wbsElementId, WBS_Element_Status.COMPLETE);
      await createTestProject(user, orgId, undefined, carId, 1, 2, new Date());
      const active = await createTestProject(user, orgId, undefined, carId, 1, 3);

      const projects = await RetrospectiveService.getRetrospectiveTimelines(orgId);

      expect(projects.map((project) => project.id)).toEqual([active.projectId]);
    });
  });
});
