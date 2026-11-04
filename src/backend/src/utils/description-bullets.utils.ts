import prisma, { PrismaTransactionClient } from '../prisma/prisma.js';
import { DescriptionBullet, DescriptionBulletPreview, isLeadership, User } from 'shared';
import { Description_Bullet, Prisma } from '@prisma/client';
import { HttpException, NotFoundException } from './errors.utils.js';
import { ChangeListValue } from './changes.utils.js';
import { userHasPermission } from './users.utils.js';
import { DescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';

export type DescriptionBulletWithType = Prisma.Description_BulletGetPayload<DescriptionBulletQueryArgs>;

export const separateDescriptionBulletsByType = (descriptionBullets: DescriptionBulletPreview[]) => {
  const descriptionBulletsSeparatedByType = new Map<string, DescriptionBulletPreview[]>();
  for (const descriptionBullet of descriptionBullets) {
    if (descriptionBulletsSeparatedByType.has(descriptionBullet.type)) {
      descriptionBulletsSeparatedByType.get(descriptionBullet.type)?.push(descriptionBullet);
    } else {
      descriptionBulletsSeparatedByType.set(descriptionBullet.type, [descriptionBullet]);
    }
  }
  return descriptionBulletsSeparatedByType;
};

export const hasBulletCheckingPermissions = async (user: User, descriptionId: string, organizationId: string) => {
  const descriptionBullet = await prisma.description_Bullet.findUnique({
    where: { descriptionId },
    include: {
      wbsElement: {
        include: {
          lead: true,
          manager: true
        }
      }
    }
  });

  if (!user || !descriptionBullet || !descriptionBullet.wbsElement) return false;

  const leader = descriptionBullet.wbsElement.lead;
  const { manager } = descriptionBullet.wbsElement;

  return (
    (await userHasPermission(user.userId, organizationId, isLeadership)) ||
    (leader && leader.userId === user.userId) ||
    (manager && manager.userId === user.userId)
  );
};

/**
 * Validates that there are no unchecked expected activities or delivrerables
 * @param workPackage Work package to check bullets for
 * @throws if there are any unchecked expected activities or deliverables
 */
export const throwIfUncheckedDescriptionBullets = (descriptionBullets: Description_Bullet[]) => {
  // checks for any unchecked expected activities, if there are any it will return an error
  if (descriptionBullets.some((element) => element.dateTimeChecked === null && element.dateDeleted === null))
    throw new HttpException(400, `Work Package has unchecked expected activities`);
};

export const descriptionBulletToChangeListValue = (
  descriptionBullet: DescriptionBulletPreview
): ChangeListValue<DescriptionBulletPreview> => {
  return {
    element: descriptionBullet,
    comparator: `${descriptionBullet.detail}`,
    displayValue: descriptionBullet.detail
  };
};

export const descriptionBulletToDescriptionBulletPreview = (
  descriptionBullet: DescriptionBulletWithType
): DescriptionBulletPreview => {
  return {
    id: descriptionBullet.descriptionId,
    detail: descriptionBullet.detail,
    type: descriptionBullet.descriptionBulletType.name
  };
};

export const descriptionBulletsToChangeListValues = (
  descriptionBullets: DescriptionBulletWithType[]
): ChangeListValue<DescriptionBulletPreview>[] => {
  return descriptionBullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => descriptionBulletToChangeListValue(descBulletConverter(bullet)));
};

/**
 * Converts a DescriptionBulletWithType to a DescriptionBullet
 * @param descBullet the DescriptionBulletWithType to convert
 * @returns the converted DescriptionBullet
 */
export const descBulletConverter = (descBullet: DescriptionBulletWithType): DescriptionBullet => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    type: descBullet.descriptionBulletType.name
  };
};

// helper method to add the given description bullets into the database, linked to the given wbs element id
export const addDescriptionBulletsToWbsElement = async (
  addedDetails: string[],
  wbsElementId: string,
  typeName: string,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const wbsElement = await tx.wBS_Element.findUnique({ where: { wbsElementId } });
  if (!wbsElement) throw new NotFoundException('WBS Element', wbsElementId);

  const foundType = await validateDescriptionBulletType(typeName, organizationId);

  if (addedDetails.length > 0) {
    await tx.description_Bullet.createMany({
      data: addedDetails.map((element) => {
        return {
          detail: element,
          wbsElementId: wbsElement.wbsElementId,
          descriptionBulletTypeId: foundType.id
        };
      })
    });
  }
};

export const addDescriptionBulletsToWorkPackageTemplate = async (
  addedDetails: string[],
  templateId: string,
  typeName: string,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const template = await tx.work_Package_Template.findUnique({ where: { wbsElementTemplateId: templateId } });
  if (!template) throw new NotFoundException('Work Package Template', templateId);

  const foundType = await validateDescriptionBulletType(typeName, organizationId);

  if (addedDetails.length > 0) {
    await tx.description_Bullet.createMany({
      data: addedDetails.map((element) => {
        return {
          detail: element,
          workPackageTemplateId: templateId,
          descriptionBulletTypeId: foundType.id
        };
      })
    });
  }
};

export const addDescriptionBulletsToProjectTemplate = async (
  addedDetails: string[],
  templateId: string,
  typeName: string,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const template = await tx.project_Template.findUnique({ where: { wbsElementTemplateId: templateId } });
  if (!template) throw new NotFoundException('Project Template', templateId);

  const foundType = await validateDescriptionBulletType(typeName, organizationId);

  if (addedDetails.length > 0) {
    await tx.description_Bullet.createMany({
      data: addedDetails.map((element) => {
        return {
          detail: element,
          projectTemplateId: templateId,
          descriptionBulletTypeId: foundType.id
        };
      })
    });
  }
};

export enum DescriptionBulletDestination {
  WBS_ELEMENT,
  WORK_PACKAGE_TEMPLATE,
  PROJECT_TEMPLATE
}

export const addRawDescriptionBullets = async (
  descriptionBullets: DescriptionBulletPreview[],
  destination: DescriptionBulletDestination,
  destinationId: string,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const descriptionBulletsSeparatedByType = separateDescriptionBulletsByType(descriptionBullets);

  // await each write so errors are caught and the writes stay inside the caller's transaction
  for (const [type, bullets] of descriptionBulletsSeparatedByType) {
    const details = bullets.map((bullet) => bullet.detail);
    switch (destination) {
      case DescriptionBulletDestination.WBS_ELEMENT:
        await addDescriptionBulletsToWbsElement(details, destinationId, type, organizationId, tx);
        break;
      case DescriptionBulletDestination.WORK_PACKAGE_TEMPLATE:
        await addDescriptionBulletsToWorkPackageTemplate(details, destinationId, type, organizationId, tx);
        break;
      case DescriptionBulletDestination.PROJECT_TEMPLATE:
        await addDescriptionBulletsToProjectTemplate(details, destinationId, type, organizationId, tx);
        break;
      // removed proposed changes case dead code
    }
  }
};

// edit descrption bullets in the db for each id and detail pair
export const editDescriptionBullets = async (
  editedIdsAndDetails: DescriptionBulletPreview[],
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  // await each write so errors are caught and the writes stay inside the caller's transaction
  for (const element of editedIdsAndDetails) {
    const foundType = await tx.description_Bullet_Type.findUnique({
      where: { uniqueDescriptionBulletType: { name: element.type, organizationId } }
    });
    if (!foundType) throw new NotFoundException('Description Bullet Type', element.type);

    await tx.description_Bullet.update({
      where: { descriptionId: element.id },
      data: { detail: element.detail, descriptionBulletTypeId: foundType.id }
    });
  }
};

export const validateDescriptionBullets = async (
  descriptionBullets: DescriptionBulletPreview[],
  organizationId: string
): Promise<void> => {
  const promises = descriptionBullets.map(async (bullet) => {
    await validateDescriptionBulletType(bullet.type, organizationId);
  });
  await Promise.all(promises);
};

export const validateDescriptionBulletType = async (typeName: string, organizationId: string) => {
  const foundType = await prisma.description_Bullet_Type.findUnique({
    where: { uniqueDescriptionBulletType: { name: typeName, organizationId } }
  });
  if (!foundType) throw new NotFoundException('Description Bullet Type', typeName);

  return foundType;
};

export const markDescriptionBulletsAsDeleted = async (
  descriptionBullets: DescriptionBulletPreview[],
  tx: PrismaTransactionClient = prisma
) => {
  await tx.description_Bullet.updateMany({
    where: {
      descriptionId: {
        in: descriptionBullets.map((bullet) => bullet.id)
      }
    },
    data: {
      dateDeleted: new Date()
    }
  });
};
