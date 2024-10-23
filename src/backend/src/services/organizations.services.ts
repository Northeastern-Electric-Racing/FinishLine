import { Organization, User } from '@prisma/client';
import { LinkCreateArgs, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { createUsefulLinks } from '../utils/organizations.utils';
import { linkTransformer } from '../transformers/links.transformer';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { uploadFile } from '../utils/google-integration.utils';
import { getProjects } from '../utils/projects.utils';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';

export default class OrganizationsService {
  /**
   * Gets the current organization
   * @param organizationId the organizationId to be fetched
   */
  static async getCurrentOrganization(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
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
    applyInterestImage: Express.Multer.File,
    exploreAsGuestImage: Express.Multer.File,
    submitter: User,
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update images');

    const applyInterestImageData = uploadFile(applyInterestImage);
    const exploreAsGuestImageData = uploadFile(exploreAsGuestImage);

    const newImages = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
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
   * Gets all organization Images for the given organization Id
   * @param organizationId organization Id of the milestone
   * @returns all the milestones from the given organization
   */

  static async getOrganizationImages(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return {
      applyInterestImage: organization.applyInterestImageId,
      exploreAsGuestImage: organization.exploreAsGuestImageId
    };
  }

  /**
   * Updates the featured projects of an organization
   * @param projectIds project ids of featured projects
   * @param organization user's organization
   * @param submitter user submitting featured projects
   * @returns updated organization with featured projects
   */
  static async setFeaturedProjects(projectIds: string[], organization: Organization, submitter: User) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update featured projects');

    //throws if all projects are not found
    const featuredProjects = await getProjects(projectIds, organization.organizationId);

    const updatedOrg = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: {
        featuredProjects: {
          set: featuredProjects.map((project) => ({ projectId: project.projectId }))
        }
      },
      include: { featuredProjects: true }
    });

    return updatedOrg;
  }

  /**
   * Sets the logo for an organization, User must be admin
   * @param logoImage the image which will be uploaded and have its id stored in the org
   * @param submitter the user submitting the logo
   * @param organization the organization who's logo is being set
   * @returns the updated organization
   * @throws if the user is not an admin
   */
  static async setLogoImage(
    logoImage: Express.Multer.File,
    submitter: User,
    organization: Organization
  ): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update logo');
    }

    const logoImageData = await uploadFile(logoImage);

    const updatedOrg = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: {
        logoImageId: logoImageData.id
      }
    });

    return updatedOrg;
  }

  /**
   * Gets the logo image of the organization
   * @param organizationId the id of the organization
   * @returns the id of the image
   */
  static async getLogoImage(organizationId: string): Promise<string> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!organization.logoImageId) {
      throw new HttpException(404, `Organization ${organizationId} does not have a logo image`);
    }

    return organization.logoImageId;
  }

  /**
   * Gets the featured projects for the given organization Id
   * @param organizationId the organization to get the projects for
   * @returns all the featured projects for the organization
   */
  static async getOrganizationFeaturedProjects(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: { featuredProjects: true }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return organization.featuredProjects;
  }
}
