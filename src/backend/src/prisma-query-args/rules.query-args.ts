import { Prisma } from '@prisma/client';
// write types and query args below here

// preview for rule display
export const getRulePreviewQueryArgs = () =>
  Prisma.validator<Prisma.RuleDefaultArgs>()({
    select: {
      ruleId: true,
      ruleCode: true,
      ruleContent: true,
      imageFileIds: true
    }
  });

export const getProjectRuleQueryArgs = () =>
  Prisma.validator<Prisma.Project_RuleDefaultArgs>()({
    include: {
      rule: getRulePreviewQueryArgs(),
      project: { select: { projectId: true } }
    }
  });
