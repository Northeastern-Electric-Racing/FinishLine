import prisma from '../prisma/prisma';
import { DescriptionBullet, DescriptionBulletPreview, isLeadership } from 'shared';
import { Description_Bullet, Prisma } from '@prisma/client';
import { HttpException, NotFoundException } from './errors.utils';
import { ChangeListValue } from './changes.utils';
import { userHasPermission } from './users.utils';
import { DescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';

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

export const hasBulletCheckingPermissions = async (userId: number, descriptionId: number, organizationId: string) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) return false;

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

  if (!descriptionBullet) return false;
  if (!descriptionBullet.wbsElement) return false;

  const leader = descriptionBullet.wbsElement.lead;
  const { manager } = descriptionBullet.wbsElement;

  return (
    (await userHasPermission(userId, organizationId, isLeadership)) ||
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
    comparator: `${descriptionBullet.id}`,
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
  wbsElementId: number,
  typeName: string,
  organizationId: string
) => {
  const wbsElement = await prisma.wBS_Element.findUnique({ where: { wbsElementId } });
  if (!wbsElement) throw new NotFoundException('WBS Element', wbsElementId);

  const foundType = await validateDescriptionBulletType(typeName, organizationId);

  if (addedDetails.length > 0) {
    await prisma.description_Bullet.createMany({
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

export const addDescriptionBulletsToTemplate = async (
  addedDetails: string[],
  templateId: string,
  typeName: string,
  organizationId: string
) => {
  const template = await prisma.work_Package_Template.findUnique({ where: { workPackageTemplateId: templateId } });
  if (!template) throw new NotFoundException('Work Package Template', templateId);

  const foundType = await validateDescriptionBulletType(typeName, organizationId);

  if (addedDetails.length > 0) {
    await prisma.description_Bullet.createMany({
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

export enum DescriptionBulletDestination {
  WBS_ELEMENT,
  TEMPLATE,
  PROPOSED_CHANGES
}

export const addRawDescriptionBullets = async (
  descriptionBullets: DescriptionBulletPreview[],
  destination: DescriptionBulletDestination,
  destinationId: string | number,
  organizationId: string
) => {
  const descriptionBulletsSeparatedByType = separateDescriptionBulletsByType(descriptionBullets);
  const promises: Promise<void>[] = [];
  for (const [type, bullets] of descriptionBulletsSeparatedByType) {
    switch (destination) {
      case DescriptionBulletDestination.WBS_ELEMENT:
        promises.concat(
          addDescriptionBulletsToWbsElement(
            bullets.map((bullet) => bullet.detail),
            destinationId as number,
            type,
            organizationId
          )
        );
        break;
      case DescriptionBulletDestination.TEMPLATE:
        promises.concat(
          addDescriptionBulletsToTemplate(
            bullets.map((bullet) => bullet.detail),
            destinationId as string,
            type,
            organizationId
          )
        );
        break;
      case DescriptionBulletDestination.PROPOSED_CHANGES:
        // TODO add proposed changes
        break;
    }
  }

  await Promise.all(promises);
};

// edit descrption bullets in the db for each id and detail pair
export const editDescriptionBullets = async (editedIdsAndDetails: DescriptionBulletPreview[], organizationId: string) => {
  if (editedIdsAndDetails.length < 1) return;
  const promises = editedIdsAndDetails.map(async (element) => {
    const foundType = await prisma.description_Bullet_Type.findUnique({
      where: { uniqueDescriptionBulletType: { name: element.type, organizationId } }
    });
    if (!foundType) throw new NotFoundException('Description Bullet Type', element.type);

    await prisma.description_Bullet.update({
      where: { descriptionId: element.id },
      data: { detail: element.detail, descriptionBulletTypeId: foundType.id }
    });
  });
  await Promise.resolve(promises);
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

export const markDescriptionBulletsAsDeleted = async (descriptionBullets: DescriptionBulletPreview[]) => {
  await prisma.description_Bullet.updateMany({
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
