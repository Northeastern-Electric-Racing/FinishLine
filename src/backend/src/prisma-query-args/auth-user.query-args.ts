import { Prisma } from '@prisma/client';

const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true
  }
});

export default authUserQueryArgs;
