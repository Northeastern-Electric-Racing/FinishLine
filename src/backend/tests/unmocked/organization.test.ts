import { LinkCreateArgs } from 'shared';
import OrganizationsService from '../../src/services/organizations.service';
import { AccessDeniedAdminOnlyException, HttpException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestLinkType, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Team Type Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    orgId = (await createTestOrganization()).organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Set Useful Links', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(wonderwomanGuest, orgId), orgId, [])
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update useful links'));
    });
    it('Fails if a link type does not exist', async () => {
      const testLink: LinkCreateArgs[] = [
        {
          linkId: '1',
          linkTypeName: 'example link type',
          url: 'https://example.com/link1'
        }
      ];

      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, testLink)
      ).rejects.toThrow(new HttpException(400, `Link type with name 'example link type' not found`));
    });

    it('succeds and updates all the links', async () => {
      const testLink: LinkCreateArgs[] = [
        {
          linkId: '1',
          linkTypeName: 'Link type 1',
          url: 'https://example.com/link1'
        }
      ];
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestLinkType(testBatman, orgId);
      await OrganizationsService.setUsefulLinks(testBatman, orgId, testLink);
      const organization = prisma.organization.findUnique({
        where: {
          organizationId: orgId
        },
        include: {
          usefulLinks: true
        }
      });

      expect(organization.usefulLinks.length).toBe(1);
    });
  });
});
