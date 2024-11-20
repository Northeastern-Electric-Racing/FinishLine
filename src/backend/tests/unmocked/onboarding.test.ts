import { Organization } from '@prisma/client';

import {
  createTestChecklist,
  createTestChecklistItem,
  createTestOrganization,
  createTestTeamType,
  createTestUser,
  resetUsers
} from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';
import TeamsService from '../../src/services/teams.services';

describe('Onboarding tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get all Checklists', () => {
    it('Gets all checklists and checklistItems for the given organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      const checklist2 = await createTestChecklist(batman, orgId);
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists[0].checklistId).toEqual(checklist1.checklistId);
      expect(allChecklists[1].checklistId).toEqual(checklist2.checklistId);
      expect(allChecklists[0].checklistItems.length).toEqual(1);
    });

    it('Gets all checklists and checklistItems that are not deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      await prisma.checklist.update({
        where: { checklistId: checklist1.checklistId },
        data: { checklistItems: { deleteMany: {} } }
      });
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists.length).toEqual(1);
      expect(allChecklists[0].checklistItems.length).toEqual(0);
    });
  });

  describe('Get Checked Checklists', () => {
    it('Succeeds and gets all checked checklists for the user', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      const uncheckedChecklists = await OnboardingServices.getCheckedChecklists(batman, organization);
      expect(uncheckedChecklists[0].checklistItems.length).toEqual(0);
      await prisma.checklistItem.update({
        where: { checklistItemId: checklist1.checklistItems[0].checklistItemId },
        data: { usersChecked: { connect: { userId: batman.userId } } }
      });
      const checkedChecklists = await OnboardingServices.getCheckedChecklists(batman, organization);
      expect(checkedChecklists[0].checklistItems.length).toEqual(1);
    });
  });

  describe("Get User's Checklists", () => {
    it('Throws an error if the user does not have any teams', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(async () => await OnboardingServices.getUsersChecklists(batman)).rejects.toThrow(
        new HttpException(404, 'This user does not have any teams')
      );
    });

    it('Returns all general checklists when checklist fails to match user teamType', async () => {
      createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member (getUsersChecklists requires user to be on a team)
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: { members: { connect: { userId: user.userId } } }
      });

      // Create a checklist, set its teamTypeId to null to be a general checklist
      const checklist = await createTestChecklist(user, orgId);
      const generalChecklist = await prisma.checklist.update({
        where: { checklistId: checklist.checklistId },
        data: { teamTypeId: null },
        include: { checklistItems: true }
      });

      const result = await OnboardingServices.getUsersChecklists(user);
      expect(result).toStrictEqual([generalChecklist]);
    });

    it('Returns all general checklist and matching checklists of user teamType', async () => {
      const teamType = await createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: {
          members: { connect: { userId: user.userId } },
          teamType: { connect: { teamTypeId: teamType.teamTypeId } }
        }
      });

      // Create a checklist, set its teamTypeId to null to be a general checklist
      const checklist = await createTestChecklist(user, orgId);
      const generalChecklist = await prisma.checklist.update({
        where: { checklistId: checklist.checklistId },
        data: { teamTypeId: null },
        include: { checklistItems: true }
      });

      // Create a checklist that matches the user's team type
      const teamChecklist = await createTestChecklist(user, orgId);

      const result = await OnboardingServices.getUsersChecklists(user);
      expect(result).toEqual([generalChecklist, teamChecklist]);
    });

    it('Returns an empty array when a user is on a team but there are no checklists', async () => {
      const teamType = createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: {
          members: { connect: { userId: user.userId } },
          teamType: { connect: { teamTypeId: (await teamType).teamTypeId } }
        }
      });

      const result = await OnboardingServices.getUsersChecklists(user);
      expect(result).toStrictEqual([]);
    });
  });

  describe('Create Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'teamTypeId',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to create a checklist'));
    });

    it('Fails if team type does not exists', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'teamType',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team Type', 'teamType'));
    });

    it('Succeeds and creates a checklist', async () => {
      createTestTeamType('id', organization);
      const result = await OnboardingServices.createChecklist(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'id',
        organization
      );
      expect(result.name).toEqual('name');
      expect(result.teamTypeId).toEqual('id');
    });
  });

  describe('Update User Checklists', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            await createTestUser(wonderwomanGuest, orgId),
            'userId',
            ['checklistId'],
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('Only an admin can update a user`s checklists'));
    });

    it('Fails if user does not exist', async () => {
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            await createTestUser(batmanAppAdmin, orgId),
            'userId',
            ['checklistId'],
            organization
          )
      ).rejects.toThrow(new NotFoundException('User', 'userId'));
    });

    it('Fails if one or more checklistId does not exist', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            batman,
            batman.userId,
            ['checklistId1', 'checklistId2'],
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'one or more checklistIds were not valid'));
    });

    it('Suceeds and adds the user checklists', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      const checklist2 = await createTestChecklist(batman, orgId);
      const checklistIds = [checklist1.checklistId, checklist2.checklistId];
      await OnboardingServices.updateUserChecklists(batman, batman.userId, checklistIds, organization);
      const updatedBatman = await prisma.user.findUnique({
        where: { userId: batman.userId },
        include: { onboardingChecklists: true }
      });
      expect(updatedBatman?.onboardingChecklists[0].checklistId).toEqual(checklist1.checklistId);
      expect(updatedBatman?.onboardingChecklists[1].checklistId).toEqual(checklist2.checklistId);
      await OnboardingServices.updateUserChecklists(batman, batman.userId, [], organization);
      const deletedBatman = await prisma.user.findUnique({
        where: { userId: batman.userId },
        include: { onboardingChecklists: true }
      });
      expect(deletedBatman?.onboardingChecklists.length).toEqual(0);
    });
  });

  describe('Delete Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklist(await createTestUser(wonderwomanGuest, orgId), 'id', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete a checklist'));
    });

    it('Fails if checklistId is not found', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklist(await createTestUser(batmanAppAdmin, orgId), 'id1', organization)
      ).rejects.toThrow(new HttpException(400, 'Checklist with id: id1 not found!'));
    });

    it('Fails if checklist is already deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testChecklist = await createTestChecklist(testSuperman, orgId);
      await OnboardingServices.deleteChecklist(testSuperman, testChecklist.checklistId, organization);

      await expect(
        async () => await OnboardingServices.deleteChecklist(testSuperman, testChecklist.checklistId, organization)
      ).rejects.toThrow(new DeletedException('Checklist', testChecklist.checklistId));
    });

    it('Succeeds and deletes checklist', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testChecklist1 = await createTestChecklist(testSuperman, orgId);
      await OnboardingServices.deleteChecklist(testSuperman, testChecklist1.checklistId, organization);

      const updatedTestChecklist1 = await prisma.checklist.findUnique({
        where: { checklistId: testChecklist1.checklistId }
      });

      expect(updatedTestChecklist1?.dateDeleted).not.toBe(null);
    });

    it('Succeeds and deletes checklist with all its items', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testChecklist1 = await createTestChecklist(testSuperman, orgId);
      await OnboardingServices.deleteChecklist(testSuperman, testChecklist1.checklistId, organization);
      expect(testChecklist1.checklistItems.length).toBe(1);

      const updatedTestChecklist1 = await prisma.checklist.findUnique({
        where: { checklistId: testChecklist1.checklistId },
        include: {
          checklistItems: {
            where: { dateDeleted: null }
          }
        }
      });

      expect(updatedTestChecklist1?.dateDeleted).not.toBe(null);
      expect(updatedTestChecklist1?.checklistItems.length).toBe(0);
    });
  });

  describe('Create Checklist Item', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'checklistId',
            'description',
            'parentChecklistItemId',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to create a checklist item'));
    });

    it('Fails if checklist does not exist', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'checklistId',
            'description',
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist', 'checklistId'));
    });

    it('Fails if parent checklist item does not exist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            testBatman,
            'name',
            testChecklistId,
            'parentChecklistItemId',
            'description',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist Item', 'parentChecklistItemId'));
    });

    it('Fails if checklist of parent checklist item does not equal given checklist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklist1 = await createTestChecklist(testBatman, orgId);
      const testChecklist2 = await createTestChecklist(testBatman, orgId);
      const testParentChecklistItem = await createTestChecklistItem(testBatman, testChecklist1.checklistId, orgId);
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            testBatman,
            'name',
            testChecklist2.checklistId,
            testParentChecklistItem.checklistItemId,
            'description',
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Cannot have parent checklist item with a different checklist'));
    });

    it('Succeeds and creates a checklist item', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      const result = await OnboardingServices.createChecklistItem(
        testBatman,
        'name',
        testChecklistId,
        null,
        null,
        organization
      );
      expect(result.name).toEqual('name');
      expect(result.checklistId).toEqual(testChecklistId);
    });
  });

  describe('Delete Checklist Item', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklistItem(await createTestUser(wonderwomanGuest, orgId), 'id', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete a checklist item'));
    });

    it('Fails if checklist item does not exist', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklistItem(await createTestUser(batmanAppAdmin, orgId), 'id1', organization)
      ).rejects.toThrow(new NotFoundException('Checklist Item', 'id1'));
    });

    it('Fails if checklist item is already deleted', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      const testChecklistItem = await createTestChecklistItem(testBatman, testChecklistId, orgId);
      await OnboardingServices.deleteChecklistItem(testBatman, testChecklistItem.checklistItemId, organization);

      await expect(
        async () => await OnboardingServices.deleteChecklistItem(testBatman, testChecklistItem.checklistItemId, organization)
      ).rejects.toThrow(new DeletedException('Checklist Item', testChecklistItem.checklistItemId));
    });

    it('Succeeds and deletes checklist item and its children', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      const testChecklistItem1 = await createTestChecklistItem(testBatman, testChecklistId, orgId);
      const testChecklistItem2 = await createTestChecklistItem(
        testBatman,
        testChecklistId,
        orgId,
        testChecklistItem1.checklistItemId
      );

      expect(testChecklistItem1?.dateDeleted).toBe(null);
      expect(testChecklistItem2?.dateDeleted).toBe(null);

      await OnboardingServices.deleteChecklistItem(testBatman, testChecklistItem1.checklistItemId, organization);

      const updatedTestChecklistItem1 = await prisma.checklistItem.findUnique({
        where: { checklistItemId: testChecklistItem1.checklistItemId }
      });

      const updatedTestChecklistItem2 = await prisma.checklistItem.findUnique({
        where: { checklistItemId: testChecklistItem2.checklistItemId }
      });

      expect(updatedTestChecklistItem1?.dateDeleted).not.toBe(null);
      expect(updatedTestChecklistItem2?.dateDeleted).not.toBe(null);
    });
  });
});
