import { Prisma } from '@prisma/client';

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
      },
      teams: {
        select: {
          teamId: true,
          teamName: true
        }
      },
      projects: {
        where: { dateDeleted: null },
        select: {
          project: {
            select: {
              projectId: true,
              wbsElement: {
                select: {
                  name: true
                }
              },
              teams: {
                select: {
                  teamId: true
                }
              }
            }
          }
        }
      },
      completedBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      completedInProject: {
        select: {
          projectId: true,
          wbsElement: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

export type ProjectRuleQueryArgs = ReturnType<typeof getProjectRuleQueryArgs>;

export const getProjectRuleQueryArgs = () =>
  Prisma.validator<Prisma.Project_RuleDefaultArgs>()({
    include: {
      rule: getRulePreviewQueryArgs()
    }
  });

export type RulesetQueryArgs = ReturnType<typeof getRulesetQueryArgs>;

export const getRulesetQueryArgs = () =>
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
      car: {
        include: {
          wbsElement: true
        }
      }
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
        include: {
          wbsElement: true
        }
      }
    }
  });
