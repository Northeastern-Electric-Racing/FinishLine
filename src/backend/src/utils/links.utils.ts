import { LinkCreateArgs } from 'shared';
import { ChangeCreateArgs } from './changes.utils';
import prisma from '../prisma/prisma';
import { NotFoundException } from './errors.utils';

/**
 * updates the given links in the database
 * @param linkChanges The changes to the links
 * @param projectId the project of the links
 * @param userId the user making the changes
 * @param organizationId the organization of the project
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
  organizationId: string
) => {
  const promises = linkChanges.addedElements.map(async (link) => {
    const linkType = await prisma.link_Type.findUnique({
      where: {
        uniqueLinkType: { name: link.linkTypeName, organizationId }
      }
    });

    if (!linkType) throw new NotFoundException('Link Type', `${link.linkTypeName}`);

    await prisma.link.create({
      data: {
        url: link.url,
        linkTypeId: linkType.id,
        creatorId: userId,
        wbsElementId
      }
    });
  });

  const editPromises = linkChanges.editedElements.map(async (link) => {
    await prisma.link.update({
      where: {
        linkId: link.linkId
      },
      data: {
        ...link
      }
    });
  });

  const deletePromises = linkChanges.deletedElements.map(async (link) => {
    await prisma.link.update({
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
