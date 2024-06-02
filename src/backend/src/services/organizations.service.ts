import { User } from '@prisma/client';
import { Link, LinkCreateArgs, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class OrganizationsService {

    /**
     * sets an organizations useful links
     * @param submitter the user who is setting the links
     * @param organizationId the organization which the links will be set up
     * @param links the links which are being set
     */
  static async setUsefulLinks(submitter: User, organizationId: string, links: LinkCreateArgs[]) {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update useful links');

    const newLinks = await Promise.all(
      links.map(async (link) => {
        const currentLink = await prisma.link.findUnique({
          where: {
            linkId: link.linkId
          },
          include: {
            linkType: true
          }
        });

        if (!currentLink) {
          throw new HttpException(400, `Link with ID ${link.linkId} not found`);
        }

        return await prisma.link.create({
          data: {
            url: link.url,
            creatorId: submitter.userId,
            linkTypeId: currentLink.linkType.id,
            organizationId
          }
        });
      })
    );

    const newLinkIds = newLinks.map((link) => link.linkId);

    await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        usefulLinks: {
          set: newLinkIds.map((id) => ({ linkId: id }))
        }
      }
    });
  }
}
