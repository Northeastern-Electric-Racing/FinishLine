import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
// write types and query args below here

// preview for rule display
export const getRulePreviewQueryArgs = () =>
  Prisma.validator<Prisma.RuleDefaultArgs>()({
    select: {
      ruleId: true,
      ruleCode: true,
      ruleContent: true
    }
  });

export const getProjectRuleQueryArgs = () =>
  Prisma.validator<Prisma.Project_RuleDefaultArgs>()({
    include: {
      rule: getRulePreviewQueryArgs(),
      project: { select: { projectId: true } },
      statusHistory: {
        include: {
          userUpdated: {
            select: {
              userId: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }
    }
  });

export type RulesetQueryArgs = ReturnType<typeof getRulesetQueryArgs>;

export const getRulesetQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.RulesetDefaultArgs>()({
    include: {
      rules: { where: { dateDeleted: null } },
      rulesetType: true,
      car: true,
      createdBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId)
    }
  });
