import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type RulePreviewQueryArgs = ReturnType<typeof getRulePreviewQueryArgs>;

// preview for rule display
export const getRulePreviewQueryArgs = () =>
  Prisma.validator<Prisma.RuleDefaultArgs>()({
    include: {
      parentRule: {
        select: {
          ruleId: true,
          ruleCode: true
        }
      },
      subRules: {
        select: {
          ruleId: true
        }
      },
      referencedRule: {
        select: {
          ruleId: true
        }
      }
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
      rules: {
        where: { dateDeleted: null },
        select: {
          ruleId: true,
          _count: {
            select: {
              teams: true
            }
          }
        }
      },
      rulesetType: true,
      car: true,
      createdBy: getUserQueryArgs(organizationId)
    }
  });
