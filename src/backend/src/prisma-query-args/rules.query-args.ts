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
          ruleId: true,
          ruleCode: true
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
          projectRuleId: true,
          status: true,
          statusUpdatedAt: true,
          statusUpdatedBy: {
            select: {
              firstName: true,
              lastName: true
            }
          },
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
          },
          _count: {
            select: {
              statusHistory: true
            }
          }
        }
      },
      statusUpdatedBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: {
          statusHistory: true
        }
      }
    }
  });

export type ProjectRuleQueryArgs = ReturnType<typeof getProjectRuleQueryArgs>;

export const getProjectRuleQueryArgs = () =>
  Prisma.validator<Prisma.Project_RuleDefaultArgs>()({
    include: {
      rule: getRulePreviewQueryArgs(),
      statusUpdatedBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: {
          statusHistory: true
        }
      }
    }
  });

export type RuleStatusHistoryQueryArgs = ReturnType<typeof getRuleStatusHistoryQueryArgs>;

export const getRuleStatusHistoryQueryArgs = () =>
  Prisma.validator<Prisma.Rule_Status_HistoryDefaultArgs>()({
    include: {
      updatedBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      projectRule: {
        select: {
          project: {
            select: {
              wbsElement: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
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

export type RulesetTypeQueryArgs = ReturnType<typeof getRulesetTypeQueryArgs>;

export const getRulesetTypeQueryArgs = (carId?: string) =>
  Prisma.validator<Prisma.Ruleset_TypeDefaultArgs>()({
    include: {
      revisionFiles: { where: carId ? { carId } : {} }
    }
  });
