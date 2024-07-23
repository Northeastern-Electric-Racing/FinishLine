import { LinkCreateArgs } from 'shared';
import OrganizationsService from '../../src/services/organizations.service';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestLinkType, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { testLink1 } from '../test-data/organizations.test-data';
import { uploadFile } from '../../src/utils/google-integration.utils';

describe('Team Type Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    orgId = (await createTestOrganization()).organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Set Images', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () => await OrganizationsService.setImages([], await createTestUser(wonderwomanGuest, orgId), orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update images'));
    });

    it('Fails if a organization does not exist', async () => {
      await expect(
        async () => await OrganizationsService.setImages([], await createTestUser(batmanAppAdmin, orgId), '1')
      ).rejects.toThrow(new HttpException(400, `Organization with id: 1 not found!`));
    });

    it('Succeeds and updates all the images', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testFiles = [
        { originalname: 'image1.png', buffer: Buffer.from('') },
        { originalname: 'image2.png', buffer: Buffer.from('') }
      ] as Express.Multer.File[];

      await OrganizationsService.setImages(testFiles, testBatman, orgId);

      const organization = await prisma.organization.findUnique({
        where: {
          organizationId: orgId
        }
      });

      expect(organization).not.toBeNull();
      expect(organization!.interestedinApplyingImage).toBeTruthy();
      expect(organization!.exploreAsGuestImage).toBeTruthy();
    });
  });

  describe('Set Useful Links', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(wonderwomanGuest, orgId), orgId, [])
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update useful links'));
    });

    it('Fails if a organization does not exist', async () => {
      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), '1', testLink1)
      ).rejects.toThrow(new HttpException(400, `Organization with id: 1 not found!`));
    });

    it('Fails if a link type does not exist', async () => {
      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, testLink1)
      ).rejects.toThrow(new HttpException(400, `Link type with name 'example link type' not found`));
    });

    it('succeds and updates all the links', async () => {
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
    it('Fails if a organization does not exist', async () => {
      await expect(async () => await OrganizationsService.getAllUsefulLinks('1')).rejects.toThrow(
        new NotFoundException('Organization', '1')
      );
    });

    it('succeeds and gets all the links', async () => {
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
});
