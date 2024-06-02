import { User } from '@prisma/client';
import { LinkCreateArgs, isAdmin } from 'shared';
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

    const currentLinks = await prisma.organization.findUnique({
      where: { organizationId },
      select: { usefulLinks: { select: { linkId: true } } }
    });

    const currentLinkIds = currentLinks?.usefulLinks.map((link) => link.linkId);

    await prisma.link.deleteMany({
      where: {
        linkId: { in: currentLinkIds }
      }
    });

    for (const link of links) {
      const linkType = await prisma.link_Type.findUnique({
        where: {
          uniqueLinkType: {
            name: link.linkTypeName,
            organizationId
          }
        }
      });

      if (!linkType) {
        throw new HttpException(400, `Link type with name '${link.linkTypeName}' not found`);
      }

      const currentLink = await prisma.link.create({
        data: {
          linkType: {
            connect: {
              id: linkType.id
            }
          },
          url: link.url,
          creator: {
            connect: {
              userId: submitter.userId
            }
          }
        }
      });

      await prisma.organization.update({
        where: {
          organizationId
        },
        data: {
          usefulLinks: {
            connect: {
              linkId: currentLink.linkId
            }
          }
        }
      });
    }

    const organiztion = await prisma.organization.findUnique({
      where: { organizationId },
      include: {
        usefulLinks: true
      }
    });

    console.log(organiztion);
  }
}
