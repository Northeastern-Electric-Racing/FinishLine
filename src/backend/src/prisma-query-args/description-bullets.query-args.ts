import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type DescriptionBulletQueryArgs = ReturnType<typeof getDescriptionBulletQueryArgs>;

export const getDescriptionBulletQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Description_BulletDefaultArgs>()({
    select: {
      descriptionId: true,
      detail: true,
      dateAdded: true,
      descriptionBulletType: {
        select: {
          name: true
        }
      },
      dateDeleted: true,
      dateTimeChecked: true,
      userChecked: getUserQueryArgs(organizationId)
    }
  });
