import { Prisma } from '@prisma/client';
import descriptionBulletQueryArgs from '../prisma-query-args/description-bullets.query-args';

const DescriptionBullet = (
  descBullet: Prisma.Description_BulletGetPayload<typeof descriptionBulletQueryArgs>
) => {
  return {
    id: descBullet.descriptionId,
    detail: descBullet.detail,
    dateAdded: descBullet.dateAdded,
    dateDeleted: descBullet.dateDeleted ?? undefined,
    userChecked: descBullet.userChecked ?? undefined
  };
};

export default DescriptionBullet;
