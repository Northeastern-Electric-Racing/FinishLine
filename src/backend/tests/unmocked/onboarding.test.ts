import { Organization } from '@prisma/client';
import {
  createTestChecklist,
  createTestOrganization,
  createTestTeam,
  createTestTeamType,
  createTestUser,
  resetUsers
} from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

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
      const checklist1 = await createTestChecklist(batman, orgId, 'Checklist 1');
      const checklist2 = await createTestChecklist(batman, orgId, 'Checklist 2');
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists.length).toEqual(2);
      expect(allChecklists[0].checklistId).toEqual(checklist1.checklistId);
      expect(allChecklists[1].checklistId).toEqual(checklist2.checklistId);
    });

    it('Gets all checklists that are not deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId, 'Checklist 1');
      await prisma.checklist.update({
        where: { checklistId: checklist1.checklistId },
        data: { dateDeleted: new Date() }
      });
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists.length).toEqual(0);
    });
  });

  describe('Get General Checklists', () => {
    it('Gets all general checklists for the given organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId, 'Checklist 1');
      await createTestChecklist(batman, orgId, 'Checklist 2');
      const generalChecklists = await OnboardingServices.getGeneralChecklists(organization);
      expect(generalChecklists!.checklistId).toEqual(checklist1.checklistId);
    });
  });

  describe('Get Checked Checklists', () => {
    it('Succeeds and gets all checked checklists for the user', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId, 'Checklist 1');
      await createTestChecklist(batman, orgId, 'Checklist 1');
      const checklist3 = await createTestChecklist(batman, orgId, 'Checklist 1');
      const uncheckedChecklists = await OnboardingServices.getCheckedChecklists(batman, organization);
      expect(uncheckedChecklists.length).toEqual(0);
      await prisma.checklist.update({
        where: { checklistId: checklist1.checklistId },
        data: { usersChecked: { connect: { userId: batman.userId } } }
      });

      await prisma.checklist.update({
        where: { checklistId: checklist3.checklistId },
        data: { usersChecked: { connect: { userId: batman.userId } } }
      });

      const checkedChecklists = await OnboardingServices.getCheckedChecklists(batman, organization);
      expect(checkedChecklists.length).toEqual(2);
      expect(checkedChecklists[0].checklistId).toEqual(checklist1.checklistId);
      expect(checkedChecklists[1].checklistId).toEqual(checklist3.checklistId);
    });
  });

  describe('Get Users TeamType Checklists', () => {
    it('Fails if user does not exists', async () => {
      await expect(async () => await OnboardingServices.getUsersTeamTypeChecklists('1', organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it('Fails if the team types are empty', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await prisma.user.update({
        where: { userId: batman.userId },
        data: { teamsAsMember: { set: [] } }
      });
      await expect(
        async () => await OnboardingServices.getUsersTeamTypeChecklists(batman.userId, organization)
      ).rejects.toThrow(new HttpException(400, 'teamTypeIds cannot be empty'));
    });

    it('Succeeds and gets all checklists for the user and teamType', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamType1 = await createTestTeamType('teamtype1', organization);
      const teamType2 = await createTestTeamType('teamtype2', organization);
      const team1 = await createTestTeam('team1', organization, teamType1.teamTypeId, batman.userId);
      await prisma.user.update({
        where: { userId: batman.userId },
        data: { teamsAsMember: { connect: { teamId: team1.teamId } } }
      });
      const checklist1 = await createTestChecklist(batman, orgId, 'Checklist 1', teamType1.teamTypeId);
      await createTestChecklist(batman, orgId, 'Checklist 2', teamType2.teamTypeId);
      const teamTypeChecklists = await OnboardingServices.getUsersTeamTypeChecklists(batman.userId, organization);
      expect(teamTypeChecklists.length).toEqual(1);
      expect(teamTypeChecklists[0].checklistId).toEqual(checklist1.checklistId);
    });
  });

  describe('Create Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            ['description1', 'description2'],
            true,
            null,
            'teamTypeId',
            null,
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a checklist'));
    });

    it('Fails if given both teamId and teamTypeId', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            ['description1', 'description2'],
            true,
            'teamId',
            'teamTypeId',
            null,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Checklist cannot be assigned to both a team and a team type'));
    });

    it('Fails if creating a general checklist and its parent is not also a general checklist', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamtype1 = await createTestTeamType('teamtype1', organization);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklist', teamtype1.teamTypeId);
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            parentChecklist.checklistId,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Parent checklist must also be a general checklist'));
    });

    it('Fails if teamId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            'invalidTeamId',
            null,
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team', 'invalidTeamId'));
    });

    it('Fails if teamTypeId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            null,
            'invalidTeamTypeId',
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team Type', 'invalidTeamTypeId'));
    });

    it('Fails if parentChecklistId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            'invalidChecklistId',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist', 'invalidChecklistId'));
    });

    it('Fails if parentChecklistId is deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklist');
      await prisma.checklist.update({
        where: { checklistId: parentChecklist.checklistId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            parentChecklist.checklistId,
            organization
          )
      ).rejects.toThrow(new DeletedException('Checklist', parentChecklist.checklistId));
    });

    it('Fails if parentChecklistId does not match teamId or teamTypeId', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamType1 = await createTestTeamType('teamtype1', organization);
      const teamType2 = await createTestTeamType('teamtype2', organization);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklist', teamType1.teamTypeId);
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            batman,
            'name',
            ['description1', 'description2'],
            true,
            null,
            teamType2.teamTypeId,
            parentChecklist.checklistId,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Parent checklist must have the same teamId or teamTypeId'));
    });

    it('Succeeds and creates a checklist with teamTypeId', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamType1 = await createTestTeamType('teamtype1', organization);
      const result = await OnboardingServices.createChecklist(
        batman,
        'name',
        ['description1', 'description2'],
        true,
        null,
        teamType1.teamTypeId,
        null,
        organization
      );
      expect(result.name).toEqual('name');
    });
  });

  describe('Edit Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            await createTestUser(wonderwomanGuest, orgId),
            'checklidtId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            null,
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a checklist'));
    });

    it('Fails if given both teamId and teamTypeId', async () => {
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            await createTestUser(batmanAppAdmin, orgId),
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            'teamId',
            'teamTypeId',
            null,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Checklist cannot be assigned to both a team and a team type'));
    });

    it('Fails if general checklist already exists', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await createTestChecklist(batman, orgId, 'General Checklist');
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            null,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'General checklist already exists'));
    });

    it('Fails if teamId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            'invalidTeamId',
            null,
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team', 'invalidTeamId'));
    });

    it('Fails if teamTypeId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            'invalidTeamTypeId',
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team Type', 'invalidTeamTypeId'));
    });

    it('Fails if parentChecklistId is invalid', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            'invalidChecklistId',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist', 'invalidChecklistId'));
    });

    it('Fails if parentChecklistId is deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklist');
      await prisma.checklist.update({
        where: { checklistId: parentChecklist.checklistId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            null,
            parentChecklist.checklistId,
            organization
          )
      ).rejects.toThrow(new DeletedException('Checklist', parentChecklist.checklistId));
    });

    it('Fails if parentChecklistId does not match teamId or teamTypeId', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamType1 = await createTestTeamType('teamtype1', organization);
      const teamType2 = await createTestTeamType('teamtype2', organization);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklist', teamType1.teamTypeId);
      await expect(
        async () =>
          await OnboardingServices.editChecklist(
            batman,
            'checklistId',
            'name',
            ['description1', 'description2'],
            true,
            null,
            teamType2.teamTypeId,
            parentChecklist.checklistId,
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Parent checklist must have the same teamId or teamTypeId'));
    });

    it('Succeeds and edits a checklist with teamTypeId', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const teamType1 = await createTestTeamType('teamtype1', organization);
      const checklist = await createTestChecklist(batman, orgId, 'Checklist 1');
      const result = await OnboardingServices.editChecklist(
        batman,
        checklist.checklistId,
        'newName',
        ['description1', 'description2'],
        true,
        null,
        teamType1.teamTypeId,
        null,
        organization
      );
      expect(result.name).toEqual('newName');
      expect(result.teamTypeId).toEqual(teamType1.teamTypeId);
      expect(result.descriptions).toEqual(['description1', 'description2']);
    });
  });

  describe('Delete Checklist', () => {
    it('Fails if checklistId is not found', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklist(await createTestUser(batmanAppAdmin, orgId), 'id1', organization)
      ).rejects.toThrow(new HttpException(400, 'Checklist with id: id1 not found!'));
    });

    it('Fails if user is not admin', async () => {
      const checklist1 = await createTestChecklist(await createTestUser(batmanAppAdmin, orgId), orgId, 'Checklist 1');
      const wonderwoman = await createTestUser(wonderwomanGuest, orgId);
      await expect(
        async () => await OnboardingServices.deleteChecklist(wonderwoman, checklist1.checklistId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete a checklist'));
    });

    it('Fails if checklist is already deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklist = await createTestChecklist(batman, orgId, 'Checklist 1');
      await OnboardingServices.deleteChecklist(batman, testChecklist.checklistId, organization);

      await expect(
        async () => await OnboardingServices.deleteChecklist(batman, testChecklist.checklistId, organization)
      ).rejects.toThrow(new DeletedException('Checklist', testChecklist.checklistId));
    });

    it('Succeeds and deletes a checklist', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklist = await createTestChecklist(batman, orgId, 'Checklist 1');
      await OnboardingServices.deleteChecklist(batman, testChecklist.checklistId, organization);
      const checklist = await prisma.checklist.findFirst({ where: { checklistId: testChecklist.checklistId } });
      expect(checklist!.dateDeleted).not.toBeNull();
    });

    it('Succeeds and deletes a checklist with subtasks', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const parentChecklist = await createTestChecklist(batman, orgId, 'Parent Checklsit 1');
      const childChecklist = await createTestChecklist(
        batman,
        orgId,
        'Child Checklist 1',
        undefined,
        undefined,
        parentChecklist.checklistId
      );

      await OnboardingServices.deleteChecklist(batman, parentChecklist.checklistId, organization);
      const newParentChecklist = await prisma.checklist.findFirst({ where: { checklistId: parentChecklist.checklistId } });
      const newChildChecklist = await prisma.checklist.findFirst({ where: { checklistId: childChecklist.checklistId } });
      expect(newParentChecklist!.dateDeleted).not.toBeNull();
      expect(newChildChecklist!.dateDeleted).not.toBeNull();
    });
  });
});
