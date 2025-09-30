import { Prisma } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import { DescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';

const descriptionBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<DescriptionBulletQueryArgs>
): DescriptionBullet => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    type: descBullet.descriptionBulletType.name,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    userChecked: descBullet.userChecked
      ? {
          userId: descBullet.userChecked.userId,
          firstName: descBullet.userChecked.firstName,
          lastName: descBullet.userChecked.lastName
        }
      : undefined,
    dateChecked: descBullet.dateTimeChecked ?? undefined
  };
};

export default descriptionBulletTransformer;
