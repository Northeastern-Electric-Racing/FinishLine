import { Link } from 'shared';
import ProjectsService from '../../src/services/projects.services';
import { AccessDeniedAdminOnlyException, HttpException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, sharedBatman, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestLink, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
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
        async () => await ProjectsService.setUsefulLinks(await createTestUser(wonderwomanGuest, orgId), orgId, [])
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

      const testLink: Link = {
        linkId: '1',
        linkType: {
          name: 'Link Type 1',
          dateCreated: new Date(),
          creator: sharedBatman,
          required: true,
          iconName: 'icon1'
        },
        dateCreated: new Date(),
        creator: sharedBatman,
        url: 'https://example.com/link1'
      };

      await expect(
        async () => await ProjectsService.setUsefulLinks(await createTestUser(batmanAppAdmin, orgId), orgId, [testLink])
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
