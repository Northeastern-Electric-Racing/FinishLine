import { LinkCreateArgs } from 'shared';
import { User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';

export const createUsefulLinks = async (links: LinkCreateArgs[], organizationId: string, submitter: User) => {
  const newLinks = [];
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

    const newLink = await prisma.link.create({
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
    newLinks.push(newLink);
  }
  return newLinks;
};
