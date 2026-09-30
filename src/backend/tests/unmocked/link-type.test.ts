import { Organization, User } from '@prisma/client';
import { AccessDeniedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import ProjectsService from '../../src/services/projects.services.js';

describe('LinkType Tests', () => {
  let orgId: string;
  let organization: Organization;
  let testBatman: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    testBatman = await createTestUser(batmanAppAdmin, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create LinkType', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        ProjectsService.createLinkType(
          await createTestUser(wonderwomanGuest, orgId),
          'GitHub',
          'code',
          false,
          organization,
          false,
          false,
          false
        )
      ).rejects.toThrow(new AccessDeniedException('Only admins can create link types'));
    });

    it('Fails if a LinkType with that name already exists in the organization', async () => {
      await ProjectsService.createLinkType(testBatman, 'GitHub', 'code', false, organization, false, false, false);

      await expect(
        ProjectsService.createLinkType(testBatman, 'GitHub', 'code', false, organization, false, false, false)
      ).rejects.toThrow(new HttpException(400, 'LinkType with that name already exists in this organization.'));
    });

    it('Succeeds and creates a LinkType flagged for multiple dashboards at once', async () => {
      const linkType = await ProjectsService.createLinkType(
        testBatman,
        'GitHub',
        'code',
        false,
        organization,
        false,
        true,
        true
      );

      expect(linkType.isOnNewMemberDashboard).toBe(true);
      expect(linkType.isOnOnboardingDashboard).toBe(true);
      expect(linkType.isOnGuestHomePage).toBe(false);
    });
  });

  describe('Edit LinkType', () => {
    it('Fails if user is not an admin', async () => {
      await ProjectsService.createLinkType(testBatman, 'GitHub', 'code', false, organization, false, false, false);

      await expect(
        ProjectsService.editLinkType(
          'GitHub',
          'code',
          false,
          await createTestUser(wonderwomanGuest, orgId),
          organization,
          false,
          false,
          false
        )
      ).rejects.toThrow(new AccessDeniedException('Only an admin can update the linkType'));
    });

    it('Fails if the LinkType does not exist', async () => {
      await expect(
        ProjectsService.editLinkType('Nonexistent', 'code', false, testBatman, organization, false, false, false)
      ).rejects.toThrow(new NotFoundException('Link Type', 'Nonexistent'));
    });

    it('Succeeds and adds a second dashboard flag onto a LinkType already on another dashboard', async () => {
      await ProjectsService.createLinkType(testBatman, 'GitHub', 'code', false, organization, false, false, true);

      const updatedLinkType = await ProjectsService.editLinkType(
        'GitHub',
        'code',
        false,
        testBatman,
        organization,
        false,
        true,
        true
      );

      expect(updatedLinkType.isOnOnboardingDashboard).toBe(true);
      expect(updatedLinkType.isOnNewMemberDashboard).toBe(true);
      expect(updatedLinkType.isOnGuestHomePage).toBe(false);
    });
  });
});
