import { Prisma } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import descriptionBulletQueryArgs from '../prisma-query-args/description-bullets.query-args';

const descriptionBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<typeof descriptionBulletQueryArgs>
): DescriptionBullet => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    userChecked: descBullet.userChecked ?? undefined,
    dateChecked: descBullet.dateTimeChecked ?? undefined
  };
};

export default descriptionBulletTransformer;
