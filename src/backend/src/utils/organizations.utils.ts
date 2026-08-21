import { LinkCreateArgs, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { HttpException } from './errors.utils.js';

export const createUsefulLinks = async (links: LinkCreateArgs[], organizationId: string, submitter: User) => {
  const newLinks = [];
  for (const link of links) {
    const dashboardFlagCount = [link.isOnGuestHomePage, link.isOnNewMemberDashboard, link.isOnOnboardingDashboard].filter(
      Boolean
    ).length;
    if (dashboardFlagCount > 1) {
      throw new HttpException(400, 'A useful link can only be on one dashboard at a time');
    }

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

    const newLink = await prisma.link.create({
      data: {
        linkType: {
          connect: {
            id: linkType.id
          }
        },
        url: link.url,
        isOnGuestHomePage: link.isOnGuestHomePage,
        isOnNewMemberDashboard: link.isOnNewMemberDashboard,
        isOnOnboardingDashboard: link.isOnOnboardingDashboard,
        creator: {
          connect: {
            userId: submitter.userId
          }
        }
      }
    });
    newLinks.push(newLink);
  }
  return newLinks;
};
