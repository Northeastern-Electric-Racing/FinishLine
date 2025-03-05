import { Prisma } from '@prisma/client';

export type AccountCodeQueryArgs = ReturnType<typeof getAccountCodeQueryArgs>;

export const getAccountCodeQueryArgs = () =>
  Prisma.validator<Prisma.Account_CodeDefaultArgs>()({
    include: {
      allowedRefundSources: {
        include: {
          userCreated: {
            include: {
              organizations: true,
              roles: true
            }
          }
        }
      }
    }
  });
