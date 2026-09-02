import { Prisma } from '@prisma/client';

/**
 * Minimal, select-based query args backing the MCP project endpoints.
 *
 * These are intentionally separate from the main project query args: those include five levels of
 * relations, which would flood an LLM's context with data it can't use. Only select what a chat bot
 * would actually answer a question with.
 */

export type McpProjectSummaryQueryArgs = ReturnType<typeof getMcpProjectSummaryQueryArgs>;
export type McpProjectDetailQueryArgs = ReturnType<typeof getMcpProjectDetailQueryArgs>;

export const getMcpProjectSummaryQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      summary: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });

export const getMcpProjectDetailQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      summary: true,
      budget: true,
      teams: { where: { dateArchived: null }, select: { teamName: true } },
      // start/end dates and status are derived from the work packages rather than stored
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        select: {
          startDate: true,
          duration: true,
          wbsElement: { select: { status: true } }
        }
      },
      wbsElement: {
        select: {
          name: true,
          status: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          lead: { select: { firstName: true, lastName: true } },
          manager: { select: { firstName: true, lastName: true } },
          links: {
            where: { dateDeleted: null },
            select: { url: true, linkType: { select: { name: true } } }
          }
        }
      }
    }
  });
