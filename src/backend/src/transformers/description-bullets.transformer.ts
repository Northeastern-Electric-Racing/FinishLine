import { Prisma } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import { BaseDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';
import { baseUserTransformer } from './user.transformer.js';

const descriptionBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<BaseDescriptionBulletQueryArgs>
): DescriptionBullet => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    type: descBullet.descriptionBulletType.name,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    userChecked: descBullet.userChecked ? baseUserTransformer(descBullet.userChecked) : undefined,
    dateChecked: descBullet.dateTimeChecked ?? undefined
  };
};

export default descriptionBulletTransformer;
