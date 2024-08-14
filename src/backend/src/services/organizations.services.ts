import { User } from '@prisma/client';
import { LinkCreateArgs, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { createUsefulLinks } from '../utils/organizations.utils';
import { linkTransformer } from '../transformers/links.transformer';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { uploadFile } from '../utils/google-integration.utils';

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

    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      select: { usefulLinks: { select: { linkId: true } } }
    });

    if (!organization) {
      throw new HttpException(400, `Organization with id ${organizationId} doesn't exist`);
    }
    const currentLinkIds = organization?.usefulLinks.map((link) => link.linkId);

    // deleting all current useful links so they are empty before repopulating
    await prisma.link.deleteMany({
      where: {
        linkId: { in: currentLinkIds }
      }
    });

    const newLinks = await createUsefulLinks(links, organizationId, submitter);

    const newLinkIds = newLinks.map((link) => {
      return { linkId: link.linkId };
    });

    // setting the useful links to the newly created ones
    await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        usefulLinks: {
          connect: newLinkIds
        }
      }
    });

    return newLinks;
  }

  /**
   * sets an organizations images
   * @param submitter the user who is setting the images
   * @param organizationId the organization which the images will be set up
   * @param images the images which are being set
   */
  static async setImages(
    applyInterestImage: Express.Multer.File,
    exploreAsGuestImage: Express.Multer.File,
    submitter: User,
    organizationId: string
  ) {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update images');

    const applyInterestImageData = uploadFile(applyInterestImage);
    const exploreAsGuestImageData = uploadFile(exploreAsGuestImage);

    const newImages = await prisma.organization.update({
      where: { organizationId },
      data: {
        applyInterestImageId: (await applyInterestImageData).id,
        exploreAsGuestImageId: (await exploreAsGuestImageData).id
      }
    });

    return newImages;
  }

  /**
    Gets all the useful links for an organization
    @param organizationId the organization to get the links for
    @returns the useful links for the organization
  */
  static async getAllUsefulLinks(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      select: { usefulLinks: { select: { linkId: true } } }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    const links = await prisma.link.findMany({
      where: {
        linkId: { in: organization.usefulLinks.map((link) => link.linkId) }
      },
      ...getLinkQueryArgs(organizationId)
    });
    return links.map(linkTransformer);
  }
}
