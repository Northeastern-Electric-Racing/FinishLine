import prisma from '../prisma/prisma';
import projectTransformer, {
  RetrospectiveProjectPreviewQueryArgs,
  retrospectiveProjectPreviewTransformer
} from '../transformers/projects.transformer';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import { ProjectPreview, RetrospectiveProjectPreview } from 'shared';

export default class RetrospectiveService {
  static async getRetrospectiveTimelines(organizationId: string): Promise<RetrospectiveProjectPreview[]> {
    const projects = await prisma.project.findMany({
      where: { wbsElement: { organizationId } },
      ...getProjectQueryArgs(organizationId)
    });

    const retroProjects: RetrospectiveProjectPreviewQueryArgs[] = projects.map((project) => {
      return {
        ...project,
        workPackages: project.workPackages.map((workPackage) => {
          const retroWorkpackage = {
            ...workPackage,
            originalDuration: workPackage.duration,
            originalStartDate: workPackage.startDate
          };
          workPackage.wbsElement.changes.forEach((change) => {
            if (change.detail.toLowerCase().includes('added duration')) {
              const split = change.detail.split('"');
              if (split.length > 0) {
                const originalValueSplit = split[1].split('"');
                const [originalValue] = originalValueSplit;
                retroWorkpackage.originalDuration = parseFloat(originalValue);
              }
            } else if (change.detail.toLowerCase().includes('added start date')) {
              const split = change.detail.split('"');
              if (split.length > 0) {
                const originalValueSplit = split[1].split('"');
                const [originalValue] = originalValueSplit;
                retroWorkpackage.originalStartDate = new Date(originalValue);
              }
            }
          });
          return retroWorkpackage;
        })
      };
    });

    return retroProjects.map(retrospectiveProjectPreviewTransformer);
  }

  static async getRetrospectiveBudgets(organizationId: string): Promise<ProjectPreview[]> {
    const projects = await prisma.project.findMany({
      where: { wbsElement: { organizationId } },
      ...getProjectQueryArgs(organizationId)
    });

    const retroProjects = projects.map((project) => {
      const retroProject = { ...project };
      retroProject.wbsElement.changes.forEach((change) => {
        if (change.detail.toLowerCase().includes('added budget')) {
          const split = change.detail.split('"');
          if (split.length > 0) {
            const originalValueSplit = split[1].split('"');
            const [originalValue] = originalValueSplit;
            retroProject.budget = parseFloat(originalValue);
          }
        }
      });
      return retroProject;
    });

    return retroProjects.map(projectTransformer);
  }
}
