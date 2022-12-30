import { Prisma } from '@prisma/client';

export const descBulletArgs = Prisma.validator<Prisma.Description_BulletArgs>()({
  include: { userChecked: true }
});
