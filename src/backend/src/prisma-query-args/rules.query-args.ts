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
      rules: {
        where: { dateDeleted: null }
      },
      rulesetType: true,
      car: {
        include: {
          wbsElement: true
        }
      },
      createdBy: getUserQueryArgs(organizationId)
    }
  });

export const getRulesetPreviewQueryArgs = () =>
  Prisma.validator<Prisma.RulesetDefaultArgs>()({
    select: {
      name: true,
      dateCreated: true,
      rulesetType: true,
      active: true,
      car: {
        select: {
          wbsElement: true
        }
      }
    }
  });
