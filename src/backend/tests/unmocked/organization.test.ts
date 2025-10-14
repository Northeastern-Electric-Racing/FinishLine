import { LinkCreateArgs } from 'shared';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, flashAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestLinkType, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { testLink1 } from '../test-data/organizations.test-data';
import { uploadFile } from '../../src/utils/google-integration.utils';
import { Mock, vi } from 'vitest';
import OrganizationsService from '../../src/services/organizations.services';
import { Organization } from '@prisma/client';

vi.mock('../../src/utils/google-integration.utils', () => ({
  uploadFile: vi.fn()
}));

describe('Organization Tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Current Organization', () => {
    it('Fails if organization does not exist', async () => {
      await expect(async () => await OrganizationsService.getCurrentOrganization('1')).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('Succeeds and gets the organization', async () => {
      const org = await OrganizationsService.getCurrentOrganization(orgId);

      expect(org).not.toBeNull();
      expect(org.organizationId).toBe(orgId);
      expect(org.name).toBe(organization.name);
    });
  });

  describe('Set Images', () => {
    const file1 = { originalname: 'image1.png' } as Express.Multer.File;
    const file2 = { originalname: 'image2.png' } as Express.Multer.File;
    const file3 = { originalname: 'image3.png' } as Express.Multer.File;
    it('Fails if user is not an admin', async () => {
      await expect(
        OrganizationsService.setImages(file1, file2, await createTestUser(wonderwomanGuest, orgId), organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update images'));
    });

    it('Succeeds and updates all the images', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      (uploadFile as Mock).mockImplementation((file) => {
        return Promise.resolve({ id: `uploaded-${file.originalname}` });
      });

      await OrganizationsService.setImages(file1, file2, testBatman, organization);

      const oldOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(oldOrganization).not.toBeNull();
      expect(oldOrganization?.applyInterestImageId).toBe('uploaded-image1.png');
      expect(oldOrganization?.exploreAsGuestImageId).toBe('uploaded-image2.png');

      await OrganizationsService.setImages(file1, file3, testBatman, organization);

      const updatedOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(updatedOrganization?.exploreAsGuestImageId).toBe('uploaded-image3.png');
    });
  });

  describe('Set Useful Links', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        OrganizationsService.setUsefulLinks(await createTestUser(wonderwomanGuest, orgId), orgId, [])
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update useful links'));
    });

    it('Fails if a link type does not exist', async () => {
      await expect(
        OrganizationsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, testLink1)
      ).rejects.toThrow(new HttpException(400, `Link type with name 'example link type' not found`));
    });

    it('Succeeds and updates all the links', async () => {
      const testLinks1: LinkCreateArgs[] = [
        {
          linkId: '-1',
          linkTypeName: 'Link type 1',
          url: 'link 1'
        },
        {
          linkId: '-1',
          linkTypeName: 'Link type 1',
          url: 'link 2'
        }
      ];
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestLinkType(testBatman, orgId);
      await OrganizationsService.setUsefulLinks(testBatman, orgId, testLinks1);

      const organization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        },
        include: {
          usefulLinks: true
        }
      });

      expect(organization).not.toBeNull();
      expect(organization!.usefulLinks.length).toBe(2);
      expect(organization!.usefulLinks.some((link) => link.url === 'link 1')).toBeTruthy();
      expect(organization!.usefulLinks.some((link) => link.url === 'link 2')).toBeTruthy();

      // ensuring previous links are deleted and only these ones remain
      const testLinks2: LinkCreateArgs[] = [
        {
          linkId: '-1',
          linkTypeName: 'Link type 1',
          url: 'link 3'
        },
        {
          linkId: '-1',
          linkTypeName: 'Link type 1',
          url: 'link 4'
        }
      ];
      await OrganizationsService.setUsefulLinks(testBatman, orgId, testLinks2);

      const updatedOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        },
        include: {
          usefulLinks: true
        }
      });

      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization!.usefulLinks.length).toBe(2);
      expect(updatedOrganization!.usefulLinks[0].url).toBe('link 3');
      expect(updatedOrganization!.usefulLinks[1].url).toBe('link 4');
    });
  });

  describe('Get all Useful Links', () => {
    it('Succeeds and gets all the links', async () => {
      const testLinks1: LinkCreateArgs[] = [
        {
          linkId: '1',
          linkTypeName: 'Link type 1',
          url: 'link 1'
        },
        {
          linkId: '2',
          linkTypeName: 'Link type 1',
          url: 'link 2'
        }
      ];
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestLinkType(testBatman, orgId);
      await OrganizationsService.setUsefulLinks(testBatman, orgId, testLinks1);
      const links = await OrganizationsService.getAllUsefulLinks(orgId);

      expect(links).not.toBeNull();
      expect(links.length).toBe(2);
      expect(links[0].url).toBe('link 1');
      expect(links[1].url).toBe('link 2');
    });
  });

  describe('Update Application Link', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        OrganizationsService.updateApplicationLink(
          await createTestUser(wonderwomanGuest, orgId),
          'new application link',
          organization
        )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update application link'));
    });

    it('Succeeds and updates the application link', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestLinkType(testBatman, orgId);
      const updatedOrganization = await OrganizationsService.updateApplicationLink(
        testBatman,
        'new application link',
        organization
      );

      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization.applicationLink).toBe('new application link');
    });
  });

  describe('Update Onboarding Text', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OrganizationsService.setOnboardingText(await createTestUser(wonderwomanGuest, orgId), organization, 'text')
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update onboarding text'));
    });

    it('Succeeds and updates onboarding text', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const updatedOrganization = await OrganizationsService.setOnboardingText(testBatman, organization, 'Testing text');

      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization.onboardingText).toBe('Testing text');
    });
  });

  describe('Update Organization Contacts', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OrganizationsService.updateOrganizationContacts(
            await createTestUser(wonderwomanGuest, orgId),
            organization,
            [
              { userId: '1', title: 'Title 1' },
              { userId: '2', title: 'Title 2' }
            ]
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update organiztion contacts'));
    });
    it('Succeeds and creates new contacts and updates organizations contacts', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);

      await OrganizationsService.updateOrganizationContacts(testBatman, organization, [
        { userId: testBatman.userId, title: 'Chief Software Engineer' },
        { userId: testSuperman.userId, title: 'Chief Mechanical Engineer' }
      ]);

      const allContacts = await prisma.contact.findMany({
        where: {
          organizationId: orgId
        }
      });

      expect(allContacts.length).toBe(2);
      expect(allContacts.some((contact) => contact.userId === testBatman.userId)).toBeTruthy();
      expect(allContacts.some((contact) => contact.userId === testSuperman.userId)).toBeTruthy();
    });
  });

  describe('Update Organization Sponsorship Notification Channel ID', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OrganizationsService.setSlackSponsorshipNotificationSlackChannelId(
            'dummy',
            await createTestUser(wonderwomanGuest, orgId),
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set sponsorship notification channel id'));
    });

    it('Succeeds and sets the channel ID', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const updatedOrg = await OrganizationsService.setSlackSponsorshipNotificationSlackChannelId(
        'sponsorshipNotifId',
        testBatman,
        orgId
      );

      expect(updatedOrg.sponsorshipNotificationsSlackChannelId).toEqual('sponsorshipNotifId');
    });
  });

  describe('Get Finance Delegates', () => {
    it('Succeeds and returns empty array when no delegates', async () => {
      const delegates = await OrganizationsService.getFinanceDelegates(orgId);

      expect(delegates).not.toBeNull();
      expect(delegates.length).toBe(0);
    });

    it('Succeeds and returns all finance delegates', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);

      await OrganizationsService.setFinanceDelegates(testBatman, orgId, [testSuperman.userId]);

      const delegates = await OrganizationsService.getFinanceDelegates(orgId);

      expect(delegates).not.toBeNull();
      expect(delegates.length).toBe(1);
      expect(delegates[0].userId).toBe(testSuperman.userId);
      expect(delegates[0].firstName).toBe('Clark');
      expect(delegates[0].lastName).toBe('Kent');
    });
  });

  describe('Set Finance Delegates', () => {
    it('Fails if user is not admin', async () => {
      const testWonderwoman = await createTestUser(wonderwomanGuest, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);

      await expect(OrganizationsService.setFinanceDelegates(testWonderwoman, orgId, [testSuperman.userId])).rejects.toThrow(
        new AccessDeniedAdminOnlyException('set finance delegates')
      );
    });

    it('Fails if one or more user IDs do not exist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      await expect(OrganizationsService.setFinanceDelegates(testBatman, orgId, ['nonexistent-user-id'])).rejects.toThrow(
        new HttpException(404, 'One or more users not found')
      );
    });

    it('Succeeds and sets finance delegates', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testFlash = await createTestUser(flashAdmin, orgId);

      const delegates = await OrganizationsService.setFinanceDelegates(testBatman, orgId, [
        testSuperman.userId,
        testFlash.userId
      ]);

      expect(delegates).not.toBeNull();
      expect(delegates.length).toBe(2);
      expect(delegates.some((delegate) => delegate.userId === testSuperman.userId)).toBeTruthy();
      expect(delegates.some((delegate) => delegate.userId === testFlash.userId)).toBeTruthy();
    });

    it('Succeeds and replaces existing finance delegates', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testFlash = await createTestUser(flashAdmin, orgId);

      await OrganizationsService.setFinanceDelegates(testBatman, orgId, [testSuperman.userId]);

      const updatedDelegates = await OrganizationsService.setFinanceDelegates(testBatman, orgId, [testFlash.userId]);

      expect(updatedDelegates).not.toBeNull();
      expect(updatedDelegates.length).toBe(1);
      expect(updatedDelegates[0].userId).toBe(testFlash.userId);
    });
  });
});
