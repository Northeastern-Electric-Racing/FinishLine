import { LinkCreateArgs } from 'shared';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data.js';
import { createTestLinkType, createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import { testLink1 } from '../test-data/organizations.test-data.js';
import { uploadFile } from '../../src/utils/google-integration.utils.js';
import { Mock, vi } from 'vitest';
import OrganizationsService from '../../src/services/organizations.services.js';
import { Organization } from '@prisma/client';
import * as slackIntegration from '../../src/integrations/slack.js';

vi.mock('../../src/utils/google-integration.utils', () => ({
  uploadFile: vi.fn()
}));

vi.mock('../../src/integrations/slack.js', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../src/integrations/slack.js')>()),
    getRecentChannelMessages: vi.fn(),
    getChannelName: vi.fn()
  };
});

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
      expect(organization!.usefulLinks[0].url).toBe('link 1');
      expect(organization!.usefulLinks[1].url).toBe('link 2');

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

  describe('Get all featured projects', () => {
    it('Fails if an organizaion does not exist', async () => {
      await expect(async () => await OrganizationsService.getOrganizationFeaturedProjects('1')).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('Succeeds and gets featured projects', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testProject1 = await createTestProject(testBatman, orgId);

      await OrganizationsService.setFeaturedProjects([testProject1.projectId], organization, testBatman);

      const projects = await OrganizationsService.getOrganizationFeaturedProjects(orgId);

      expect(projects).not.toBeNull();
      expect(projects.length).toBe(1);
      expect(projects[0].id).toBe(testProject1.projectId);
    });
  });

  describe('Set Logo', () => {
    const file1 = { originalname: 'image1.png' } as Express.Multer.File;
    const file2 = { originalname: 'image2.png' } as Express.Multer.File;
    it('Fails if user is not an admin', async () => {
      await expect(
        OrganizationsService.setLogoImage(file1, await createTestUser(wonderwomanGuest, orgId), organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update logo'));
    });

    it('Succeeds and updates the logo', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      (uploadFile as Mock).mockImplementation((file) => {
        return Promise.resolve({ name: `${file.originalname}`, id: `uploaded-${file.originalname}` });
      });

      await OrganizationsService.setLogoImage(file1, testBatman, organization);

      const oldOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(oldOrganization).not.toBeNull();
      expect(oldOrganization?.logoImageId).toBe('uploaded-image1.png');

      await OrganizationsService.setLogoImage(file2, testBatman, organization);

      const updatedOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(updatedOrganization?.logoImageId).toBe('uploaded-image2.png');
    });
  });

  describe('Get Organization Logo', () => {
    it('Fails if an organization does not exist', async () => {
      await expect(async () => await OrganizationsService.getLogoImage('1')).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('Succeeds and gets the image', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await OrganizationsService.setLogoImage(
        { originalname: 'image1.png' } as Express.Multer.File,
        testBatman,
        organization
      );
      const image = await OrganizationsService.getLogoImage(orgId);

      expect(image).not.toBeNull();
      expect(image).toBe('uploaded-image1.png');
    });
  });

  describe('Set Organization Description', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        OrganizationsService.setOrganizationDescription(
          'test description',
          await createTestUser(wonderwomanGuest, orgId),
          organization
        )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set description'));
    });

    it('Succeeds and updates the description', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const returnedOrganization = await OrganizationsService.setOrganizationDescription(
        'sample description',
        testBatman,
        organization
      );

      const oldOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(oldOrganization).not.toBeNull();
      expect(oldOrganization?.description).toBe('sample description');
      expect(oldOrganization?.organizationId).toBe(returnedOrganization.organizationId);
      expect(oldOrganization?.description).toBe(returnedOrganization.description);
    });
  });

  describe('Set Organization Workspace Id', () => {
    it('Succeeds and updates the workspace id', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const updatedOrganization = await OrganizationsService.setSlackWorkspaceId('1234', testBatman, orgId);

      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization.slackWorkspaceId).toBe('1234');
    });
  });

  describe('Get Part Review Guide Link', () => {
    it('Fails if an organization does not exist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await expect(async () => await OrganizationsService.getPartReviewGuideLink('1', testBatman)).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('Succeeds and gets the part review guide link', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await OrganizationsService.setPartReviewGuideLink(testBatman, orgId, 'newlink');
      const guideLink = await OrganizationsService.getPartReviewGuideLink(orgId, testBatman);

      expect(guideLink).not.toBeNull();
      expect(guideLink).toBe('newlink');
    });
  });

  describe('Set Part Review Guide Link', () => {
    it('Succeeds and updates part review guide link', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const updatedOrganization = await OrganizationsService.setPartReviewGuideLink(testBatman, orgId, 'newlink');

      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization.partReviewGuideLink).toBe('newlink');
    });
  });

  describe('Set Organization Platform Logo', () => {
    const file1 = { originalname: 'image1.png' } as Express.Multer.File;
    const file2 = { originalname: 'image2.png' } as Express.Multer.File;
    const file3 = { originalname: 'image3.png' } as Express.Multer.File;
    it('Fails if user is not an admin', async () => {
      await expect(
        OrganizationsService.setPlatformLogoImage(file1, await createTestUser(wonderwomanGuest, orgId), organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update platform logo'));
    });

    it('Succeeds and updates all the images', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      (uploadFile as Mock).mockImplementation((file) => {
        return Promise.resolve({ name: `${file.originalname}`, id: `uploaded-${file.originalname}` });
      });

      await OrganizationsService.setPlatformLogoImage(file2, testBatman, organization);

      const oldOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(oldOrganization).not.toBeNull();
      expect(oldOrganization?.platformLogoImageId).toBe('uploaded-image2.png');

      await OrganizationsService.setPlatformLogoImage(file3, testBatman, organization);

      const updatedOrganization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(updatedOrganization?.platformLogoImageId).toBe('uploaded-image3.png');
    });
  });

  describe('Set New Member Slack Channel Id', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('Fails if user is not an admin', async () => {
      const testWonderwoman = await createTestUser(wonderwomanGuest, orgId);
      await expect(OrganizationsService.setNewMemberSlackChannelId('channel-id', testWonderwoman, orgId)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('set new member slack channel id')
      );
    });

    it('Succeeds and updates the new member slack channel id and its resolved name', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      (slackIntegration.getChannelName as Mock).mockResolvedValue('new-members');

      const updatedOrganization = await OrganizationsService.setNewMemberSlackChannelId('channel-id', testBatman, orgId);

      expect(slackIntegration.getChannelName).toHaveBeenCalledWith('channel-id');
      expect(updatedOrganization).not.toBeNull();
      expect(updatedOrganization.newMemberSlackChannelId).toBe('channel-id');
      expect(updatedOrganization.newMemberSlackChannelName).toBe('new-members');
    });
  });

  describe('Get New Member Slack Messages', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('Returns an empty array when no channel is configured', async () => {
      const messages = await OrganizationsService.getNewMemberSlackMessages(organization);

      expect(messages).toEqual([]);
      expect(slackIntegration.getRecentChannelMessages).not.toHaveBeenCalled();
    });

    it('Fetches the 3 most recent messages from the configured channel', async () => {
      (slackIntegration.getRecentChannelMessages as Mock).mockResolvedValue([
        { text: 'hi', userName: 'Bruce', timestamp: '2026-01-01T00:00:00.000Z', permalink: 'https://slack.com/1' }
      ]);

      const messages = await OrganizationsService.getNewMemberSlackMessages({
        ...organization,
        newMemberSlackChannelId: 'channel-id'
      });

      expect(slackIntegration.getRecentChannelMessages).toHaveBeenCalledWith('channel-id', 3);
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('hi');
    });
  });
});
