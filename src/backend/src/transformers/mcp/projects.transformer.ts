import { Prisma } from '@prisma/client';
import { calculateProjectEndDate, calculateProjectStartDate, McpProjectDetail, McpProjectSummary, wbsPipe } from 'shared';
import { McpProjectDetailQueryArgs, McpProjectSummaryQueryArgs } from '../../prisma-query-args/mcp/projects.query-args.js';
import { calculateProjectStatus } from '../../utils/projects.utils.js';
import { wbsNumOf } from '../../utils/utils.js';
import { wbsElementUrl } from '../../utils/urls.utils.js';
import { fullName } from './shared.js';

export const mcpProjectSummaryTransformer = (
  project: Prisma.ProjectGetPayload<McpProjectSummaryQueryArgs>
): McpProjectSummary => {
  const wbsNum = wbsPipe(wbsNumOf(project.wbsElement));

  return {
    wbsNum,
    name: project.wbsElement.name,
    summary: project.summary,
    viewOnFinishline: wbsElementUrl(wbsNum)
  };
};

export const mcpProjectDetailTransformer = (
  project: Prisma.ProjectGetPayload<McpProjectDetailQueryArgs>
): McpProjectDetail => {
  const wbsNum = wbsPipe(wbsNumOf(project.wbsElement));

  return {
    wbsNum,
    name: project.wbsElement.name,
    summary: project.summary,
    // derived from the work packages rather than read off the project
    status: calculateProjectStatus(project),
    budget: project.budget,
    lead: fullName(project.wbsElement.lead),
    manager: fullName(project.wbsElement.manager),
    teams: project.teams.map((team) => team.teamName),
    links: project.wbsElement.links.map((link) => ({ type: link.linkType.name, url: link.url })),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    workPackageCount: project.workPackages.length,
    viewOnFinishline: wbsElementUrl(wbsNum)
  };
};
