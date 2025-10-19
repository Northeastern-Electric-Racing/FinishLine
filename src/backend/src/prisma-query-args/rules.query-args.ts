import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type RuleQueryArgs = ReturnType<typeof getRuleQueryArgs>;

export const getRuleQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.RuleDefaultArgs>()({
    include: {
      ruleset: {
        include: {
          rulesetType: true,
          car: {
            include: {
              wbsElement: true
            }
          }
        }
      },
      parentRule: true,
      subRules: true,
      referencedRule: true,
      referencedBy: true,
      projects: {
        include: {
          project: {
            include: {
              wbsElement: true
            }
          },
          rule: true,
          statusHistory: {
            include: {
              userUpdated: getUserQueryArgs(organizationId)
            },
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      },
      createdBy: getUserQueryArgs(organizationId),
      updatedBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId)
    }
  });
