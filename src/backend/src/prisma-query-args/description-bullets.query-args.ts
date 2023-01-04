import { Prisma } from '@prisma/client';

const descriptionBulletQueryArgs = Prisma.validator<Prisma.Description_BulletArgs>()({
  include: { userChecked: true }
});

export default descriptionBulletQueryArgs;
