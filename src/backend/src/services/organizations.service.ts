import { User } from '@prisma/client';
import { LinkCreateArgs, isAdmin, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { createUsefulLinks } from '../utils/organizations.utils';
import { linkTransformer } from '../transformers/links.transformer';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { isUserLeadOrHeadOfFinanceTeam } from '../utils/reimbursement-requests.utils';
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

  static async setImages(images: Express.Multer.File[], submitter: User, organizationId: string) {
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('Guests cannot upload receipts');

    const imageData = await Promise.all(images.map((file: Express.Multer.File) => uploadFile(file)));

    const newImages = await prisma.organization.update({
      where: { organizationId },
      data: {
        interestedinApplyingImage: imageData[0].id,
        exploreAsGuestImage: imageData[1].id
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
