import { Organization } from '@prisma/client';
import { Link, LinkCreateArgs, ProjectPreview, RoleEnum, isAdmin, isAtLeastRank, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { createUsefulLinks } from '../utils/organizations.utils.js';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args.js';
import { uploadFile } from '../utils/google-integration.utils.js';
import { getProjects } from '../utils/projects.utils.js';
import { getProjectPreviewQueryArgs } from '../prisma-query-args/projects.query-args.js';
import { projectPreviewTransformer } from '../transformers/projects.transformer.js';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';
import { userTransformer } from '../transformers/user.transformer.js';
import { organizationTransformer } from '../transformers/organizationTransformer.js';

export default class OrganizationsService {
  /**
   * Retrieve all the organizations
   * @returns an array of every organization
   */
  static async getAllOrganizations(): Promise<Organization[]> {
    return prisma.organization.findMany();
  }

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

    return organizationTransformer(organization);
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
    Gets all the useful links for an organization
    @param organizationId the organization to get the links for
    @returns the useful links for the organization
  */
  static async getAllUsefulLinks(organizationId: string): Promise<Link[]> {
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
      ...getLinkQueryArgs()
    });
    return links;
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

    if (!logoImageData?.name) {
      throw new HttpException(500, 'Image Name not found');
    }

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
  static async getLogoImage(organizationId: string): Promise<string | null> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return organization.logoImageId;
  }

  /**
   * Sets the new member image for an organization, User must be admin
   * @param newMemberImage the image which will be uploaded and have its id stored in the org
   * @param submitter the user submitting the image
   * @param organization the organization whose new member image is being set
   * @returns the updated organization
   * @throws if the user is not an admin
   */
  static async setNewMemberImage(
    newMemberImage: Express.Multer.File,
    submitter: User,
    organization: Organization
  ): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update new member image');
    }

    const newMemberImageData = await uploadFile(newMemberImage);

    // Ensure name exists for frontend display purposes
    if (!newMemberImageData?.name) {
      throw new HttpException(500, 'Image Name not found');
    }

    const updatedOrg = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: {
        newMemberImageId: newMemberImageData.id
      }
    });

    return updatedOrg;
  }

  /**
   * Gets the new member image of the organization
   * @param organizationId the id of the organization
   * @returns the id of the image
   */
  static async getNewMemberImage(organizationId: string): Promise<string | null> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return organization.newMemberImageId;
  }

  /**
   * Sets the description of a given organization.
   * @param description the new description
   * @param submitter the user making the change (must be admin)
   * @param organization the organization whos description is changing
   * @throws if the user is not an admin
   */
  static async setOrganizationDescription(
    description: string,
    submitter: User,
    organization: Organization
  ): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set description');
    }
    const updatedOrg = prisma.organization.update({
      where: {
        organizationId: organization.organizationId
      },
      data: {
        description
      }
    });
    return updatedOrg;
  }

  /**
   * Sets the platform description of a given organization.
   * @param platformDescription the new platform description
   * @param submitter the user making the change
   * @param organization the organization whose platform description is changing
   * @throws if the user is not an admin
   */
  static async setPlatformDescription(platformDescription: string, submitter: User, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set platform description');
    }
    return prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { platformDescription }
    });
  }

  /**
   * Gets the featured projects for the given organization Id
   * @param organizationId the organization to get the projects for
   * @returns all the featured projects for the organization
   */
  static async getOrganizationFeaturedProjects(organizationId: string): Promise<ProjectPreview[]> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: { featuredProjects: getProjectPreviewQueryArgs(organizationId) }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return organization.featuredProjects.map(projectPreviewTransformer);
  }

  /**
   * sets the slack workspace id of the organization
   * @param workspaceId workspace id to set
   * @param submitter user who submitted the workspace id
   * @param organizationId id of organization to update with workspace id
   * @returns updated organization
   */
  static async setSlackWorkspaceId(workspaceId: string, submitter: User, organizationId: string): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set workspace id');
    }
    const updatedOrg = await prisma.organization.update({
      where: { organizationId },
      data: { slackWorkspaceId: workspaceId }
    });

    return updatedOrg;
  }

  static async getPartReviewGuideLink(organizationId: string, submitter: User) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });
    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }
    if (organization.dateDeleted) {
      throw new DeletedException('Organization', organizationId);
    }
    if (!(await userHasPermission(submitter.userId, organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role)))) {
      throw new AccessDeniedException("Only members of an organization can retrieve it's guide link");
    }
    return organization.partReviewGuideLink;
  }

  static async setPartReviewGuideLink(submitter: User, organizationId: string, guideLink: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('update part review guide links');

    const updatedOrg = await prisma.organization.update({
      where: {
        organizationId: organization.organizationId
      },
      data: {
        partReviewGuideLink: guideLink
      }
    });

    return updatedOrg;
  }

  /**
   * Sets the channel to which sponsorship notifications will be sent
   * @param channelId the slack id of the channel
   * @param submitter the user making the change
   * @param organizationId the organization to update
   * @returns the update orgization
   */
  static async setSlackSponsorshipNotificationSlackChannelId(
    channelId: string,
    submitter: User,
    organizationId: string
  ): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set sponsorship notification channel id');
    }

    const updatedOrg = await prisma.organization.update({
      where: { organizationId },
      data: { sponsorshipNotificationsSlackChannelId: channelId }
    });

    return updatedOrg;
  }

  /**
   * Gets the finance delegates for the given organization
   * @param organizationId the organization to get the finance delegates for
   * @returns all the finance delegates for the organization
   */
  static async getFinanceDelegates(organizationId: string): Promise<User[]> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: {
        financeDelegates: {
          ...getUserQueryArgs(organizationId)
        }
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (organization.dateDeleted) {
      throw new DeletedException('Organization', organizationId);
    }

    return organization.financeDelegates.map(userTransformer);
  }

  /**
   * Sets the finance delegates for the given organization
   * @param submitter the user making the change
   * @param organizationId the organization to update
   * @param userIds the user IDs to set as finance delegates
   * @returns the updated list of finance delegates
   */
  static async setFinanceDelegates(submitter: User, organizationId: string, userIds: string[]): Promise<User[]> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set finance delegates');
    }

    const userIdsNoDuplicates = Array.from(new Set(userIds));

    const users = await prisma.user.findMany({
      where: {
        userId: { in: userIdsNoDuplicates }
      }
    });

    if (users.length !== userIdsNoDuplicates.length) {
      throw new HttpException(404, 'One or more users not found');
    }

    const updatedOrg = await prisma.organization.update({
      where: { organizationId },
      data: {
        financeDelegates: {
          set: userIdsNoDuplicates.map((userId) => ({ userId }))
        }
      },
      include: {
        financeDelegates: {
          ...getUserQueryArgs(organizationId)
        }
      }
    });

    return updatedOrg.financeDelegates.map(userTransformer);
  }

  /**
   * sets an organizations platform image
   * @param submitter the user who is setting the images
   * @param organizationId the organization which the images will be set up
   * @param images the images which are being set
   */
  static async setPlatformLogoImage(platformLogoImage: Express.Multer.File, submitter: User, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update platform logo');
    }

    const platformLogoImageData = await uploadFile(platformLogoImage);

    if (!platformLogoImageData?.id || !platformLogoImageData?.name) {
      throw new HttpException(500, 'Platform logo upload failed');
    }

    const newImages = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: {
        platformLogoImageId: platformLogoImageData.id
      }
    });

    return newImages;
  }
}
