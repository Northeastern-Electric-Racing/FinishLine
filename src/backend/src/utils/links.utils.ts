import { LinkCreateArgs } from 'shared';
import { ChangeCreateArgs } from './changes.utils';
import prisma from '../prisma/prisma';

/**
 * updates the given links in the database
 * @param linkChanges The changes to the links
 * @param projectId the project of the links
 * @param userId the user making the changes
 */
export const updateLinks = async (
  linkChanges: {
    deletedElements: LinkCreateArgs[];
    addedElements: LinkCreateArgs[];
    editedElements: LinkCreateArgs[];
    changes: ChangeCreateArgs[];
  },
  wbsElementId: number,
  userId: number
) => {
  await linkChanges.addedElements.forEach(async (link) => {
    await prisma.link.create({
      data: {
        url: link.url,
        linkTypeName: link.linkTypeName,
        creatorId: userId,
        wbsElementId
      }
    });
  });

  await linkChanges.editedElements.forEach(async (link) => {
    await prisma.link.update({
      where: {
        linkId: link.linkId
      },
      data: {
        ...link
      }
    });
  });

  await linkChanges.deletedElements.forEach(async (link) => {
    await prisma.link.update({
      where: {
        linkId: link.linkId
      },
      data: {
        dateDeleted: new Date()
      }
    });
  });
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
