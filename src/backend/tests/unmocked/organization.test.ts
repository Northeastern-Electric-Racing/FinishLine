import { Link, LinkCreateArgs } from 'shared';
import OrganizationsService from '../../src/services/organizations.service';
import { AccessDeniedAdminOnlyException, HttpException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, sharedBatman, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

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
    it("Fails if one of the links don't exist", async () => {
      //   const link = await createTestLink(await createTestUser(batmanAppAdmin, orgId));

      //     const testLink: Link = {
      //         linkId: link.linkId,
      //         linkType: link.linkType,
      //         dateCreated: new Date(),
      //         creator: link.creator,
      //         url: ''
      //     }

      const testLink: LinkCreateArgs = {
        linkId: '1',
        linkTypeName: 'example link type',
        url: 'https://example.com/link1'
      };

      await expect(
        async () => await OrganizationsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, [testLink])
      ).rejects.toThrow(new HttpException(400, `Link with ID 1 not found`));
    });

    // it('succeds and updates all the links', async () => {
    //   const testLink: Link = {
    //     linkId: '1',
    //     linkType: {
    //       name: 'Link Type 1',
    //       dateCreated: new Date(),
    //       creator: sharedBatman,
    //       required: true,
    //       iconName: 'icon1'
    //     },
    //     dateCreated: new Date(),
    //     creator: sharedBatman,
    //     url: 'https://example.com/link1'
    //   };

    //   await ProjectsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, [testLink]);
    //   const organization = prisma.organization.findUnique({
    //     where: {
    //       organizationId: orgId
    //     },
    //     include: {
    //       usefulLinks: true
    //     }
    //   });

    //   expect(organization.usefulLinks.length).toBe(1);
    // });
  });
});
