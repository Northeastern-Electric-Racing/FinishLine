import { LinkCreateArgs } from 'shared';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
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

  describe('Get Organization Images', () => {
    it('Fails if an organization does not exist', async () => {
      await expect(async () => await OrganizationsService.getOrganizationImages('1')).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('Succeeds and gets all the images', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestLinkType(testBatman, orgId);
      await OrganizationsService.setImages(
        { originalname: 'image1.png' } as Express.Multer.File,
        { originalname: 'image2.png' } as Express.Multer.File,
        testBatman,
        organization
      );
      const images = await OrganizationsService.getOrganizationImages(orgId);

      expect(images).not.toBeNull();
      expect(images.applyInterestImage).toBe('uploaded-image1.png');
      expect(images.exploreAsGuestImage).toBe('uploaded-image2.png');
    });
  });
});
