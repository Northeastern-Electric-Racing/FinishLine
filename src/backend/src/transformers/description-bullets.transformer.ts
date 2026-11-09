import { Prisma } from '@prisma/client';
import { BaseDescriptionBullet, DescriptionBullet } from 'shared';
import { BaseDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';
import { baseUserTransformer } from './user.transformer.js';

export const baseDescriptionBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<BaseDescriptionBulletQueryArgs>
): BaseDescriptionBullet => ({
  id: descBullet.descriptionId,
  detail: descBullet.detail,
  dateAdded: descBullet.dateAdded,
  type: descBullet.descriptionBulletType.name,
  userChecked: descBullet.userChecked ? baseUserTransformer(descBullet.userChecked) : undefined,
  dateChecked: descBullet.dateTimeChecked ?? undefined
});

/** @deprecated Use baseDescriptionBulletTransformer. Still used by projects, wbs templates, and description bullet services until they are refactored */
const descriptionBulletTransformer = (
  descBullet: Prisma.Description_BulletGetPayload<BaseDescriptionBulletQueryArgs> & { dateDeleted: Date | null }
): DescriptionBullet => ({
  ...baseDescriptionBulletTransformer(descBullet),
  dateDeleted: descBullet.dateDeleted ?? undefined
});

export default descriptionBulletTransformer;
