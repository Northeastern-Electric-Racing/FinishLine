import { Prisma } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import { DescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';

// only the preview fields of userChecked are read, so callers may fetch a lighter user shape
type DescriptionBulletInput = Omit<Prisma.Description_BulletGetPayload<DescriptionBulletQueryArgs>, 'userChecked'> & {
  userChecked: { userId: string; firstName: string; lastName: string } | null;
};

const descriptionBulletTransformer = (descBullet: DescriptionBulletInput): DescriptionBullet => {
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
