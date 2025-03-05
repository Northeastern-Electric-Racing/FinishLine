import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type AccountCodeQueryArgs = ReturnType<typeof getAccountCodeQueryArgs>;

export const getAccountCodeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Account_CodeDefaultArgs>()({
    include: {
      allowedRefundSources: {
        include: {
          userCreated: {
            include: {
              ...getUserQueryArgs(organizationId),
              organizations: true,
              roles: true
            }
          }
        }
      }
    }
  });
