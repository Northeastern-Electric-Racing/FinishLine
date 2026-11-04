import { LinkCreateArgs } from 'shared';
import { ChangeCreateArgs } from './changes.utils.js';
import prisma, { PrismaTransactionClient } from '../prisma/prisma.js';
import { NotFoundException } from './errors.utils.js';

/**
 * updates the given links in the database
 * @param linkChanges The changes to the links
 * @param projectId the project of the links
 * @param userId the user making the changes
 * @param organizationId the organization of the project
 * @param tx the transaction client to run the writes in (defaults to prisma)
 */
export const updateLinks = async (
  linkChanges: {
    deletedElements: LinkCreateArgs[];
    addedElements: LinkCreateArgs[];
    editedElements: LinkCreateArgs[];
    changes: ChangeCreateArgs[];
  },
  wbsElementId: string,
  userId: string,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const promises = linkChanges.addedElements.map(async (link) => {
    const linkType = await tx.link_Type.findUnique({
      where: {
        uniqueLinkType: { name: link.linkTypeName, organizationId }
      }
    });

    if (!linkType) throw new NotFoundException('Link Type', `${link.linkTypeName}`);

    await tx.link.create({
      data: {
        url: link.url,
        linkTypeId: linkType.id,
        creatorId: userId,
        wbsElementId
      }
    });
  });

  const editPromises = linkChanges.editedElements.map(async (link) => {
    await tx.link.update({
      where: {
        linkId: link.linkId
      },
      data: {
        ...link
      }
    });
  });

  const deletePromises = linkChanges.deletedElements.map(async (link) => {
    await tx.link.update({
      where: {
        linkId: link.linkId
      },
      data: {
        dateDeleted: new Date()
      }
    });
  });

  await Promise.all(promises.concat(editPromises).concat(deletePromises));
};

/**
 * transforms the given link to a change list value
 * @param link the link to transform to a change list value
 * @returns the change list value
 */
export const linkToChangeListValue = (link: LinkCreateArgs) => {
  return {
    element: link,
    comparator: link.linkId,
    displayValue: `${link.linkTypeName}, ${link.url}`
  };
};
