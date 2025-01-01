import { Organization, User } from '@prisma/client';
import { LinkCreateArgs, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { createUsefulLinks } from '../utils/organizations.utils';
import { linkTransformer } from '../transformers/links.transformer';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { uploadFile } from '../utils/google-integration.utils';

export default class OrganizationsService {
  /**
   * Gets the current organization
   * @param organizationId the organizationId to be fetched
   */
  static async getCurrentOrganization(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: {
        contacts: {
          include: {
            user: true
          }
        }
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (organization.dateDeleted) {
      throw new DeletedException('Organization', organizationId);
    }

    return organization;
  }

  /**
   * sets an organizations useful links
   * @param submitter the user who is setting the links
   * @param organizationId the organization which the links will be set up
   * @param links the links which are being set
   */
  static async setUsefulLinks(submitter: User, organizationId: string, links: LinkCreateArgs[]) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: { usefulLinks: true }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update useful links');

    const currentLinkIds = organization.usefulLinks.map((link) => link.linkId);

    // deleting all current useful links so they are empty before repopulating
    await prisma.link.deleteMany({
      where: {
        linkId: { in: currentLinkIds }
      }
    });

    const newLinks = await createUsefulLinks(links, organization.organizationId, submitter);

    const newLinkIds = newLinks.map((link) => {
      return { linkId: link.linkId };
    });

    // setting the useful links to the newly created ones
    await prisma.organization.update({
      where: {
        organizationId: organization.organizationId
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
    applyInterestImage: Express.Multer.File | null,
    exploreAsGuestImage: Express.Multer.File | null,
    submitter: User,
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update images');
    }

    const applyInterestImageData = applyInterestImage ? await uploadFile(applyInterestImage) : null;
    const exploreAsGuestImageData = exploreAsGuestImage ? await uploadFile(exploreAsGuestImage) : null;

    const updateData = {
      ...(applyInterestImageData && { applyInterestImageId: applyInterestImageData.id }),
      ...(exploreAsGuestImageData && { exploreAsGuestImageId: exploreAsGuestImageData.id })
    };

    const newImages = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: updateData
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
      include: { usefulLinks: true }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    const links = await prisma.link.findMany({
      where: {
        linkId: { in: organization.usefulLinks.map((link) => link.linkId) }
      },
      ...getLinkQueryArgs(organization.organizationId)
    });
    return links.map(linkTransformer);
  }

  /**
   * Updates the application link for the given organization Id
   * @param submitter the user who is setting the links
   * @param organizationId organization Id of the organization
   * @param newLink new application link to be updated
   * @returns updated organization data
   */
  static async updateApplicationLink(submitter: User, newLink: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update application link');

    const updatedOrganization = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { applicationLink: newLink }
    });

    return updatedOrganization;
  }

  /**
   * Sets onboarding text field
   * @param submitter
   * @param organization
   * @param text
   * @returns updated organization with onboarding text
   */
  static async setOnboardingText(submitter: User, organization: Organization, onboardingText: string) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update onboarding text');
    }

    const updatedOrganization = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: {
        onboardingText
      }
    });

    return updatedOrganization;
  }

  /**
   * Updates contacts of organization
   * @param user User updating the contacts
   * @param organizationId organizationId of the organization
   * @param userIds users to be added as contacts
   * @param titles the titles of each of the user ids
   * @returns updated organization with new contacts
   */
  static async updateOrganizationContacts(
    user: User,
    organization: Organization,
    contacts: { userId: string; title: string }[]
  ) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update organiztion contacts');
    }
    const { organizationId } = organization;

    await prisma.contact.deleteMany({
      where: {
        organizationId
      }
    });

    const allContacts = await Promise.all(
      contacts.map((contact) =>
        prisma.contact.create({
          data: {
            organizationId,
            userId: contact.userId,
            title: contact.title
          }
        })
      )
    );

    const updatedOrganization = await prisma.organization.update({
      where: { organizationId },
      data: {
        contacts: {
          connect: allContacts.map((contact) => ({ contactId: contact.contactId }))
        }
      },
      include: {
        contacts: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedOrganization;
  }
}
