import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type PopUpQueryArgs = ReturnType<typeof getPopUpQueryArgs>;

export const getPopUpQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PopUpDefaultArgs>()({
    include: {
      users: getUserQueryArgs(organizationId)
    }
  });
