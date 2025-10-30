import prisma from '../prisma/prisma';
import projectTransformer, {
  RetrospectiveProjectPreviewQueryArgs,
  retrospectiveProjectPreviewTransformer
} from '../transformers/projects.transformer';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import { ProjectGantt, RetrospectiveProjectPreview } from 'shared';

export default class RetrospectiveService {
  static async getRetrospectiveTimelines(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RetrospectiveProjectPreview[]> {
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
          let minDurationChangeDate: Date | undefined = undefined;
          let minStartChangeDate: Date | undefined = undefined;
          let maxDurationChangeDate: Date | undefined = undefined;
          let maxStartChangeDate: Date | undefined = undefined;
          workPackage.wbsElement.changes.forEach((change) => {
            if (startDate && change.dateImplemented.getTime() < startDate?.getTime()) return;

            if (endDate && change.dateImplemented.getTime() > endDate?.getTime()) return;

            if (
              change.detail.toLowerCase().includes('Added duration') ||
              change.detail.toLowerCase().includes('changed duration')
            ) {
              const split = change.detail.split('"');
              if (split.length > 0) {
                if (!minDurationChangeDate || minDurationChangeDate.getTime() > change.dateImplemented.getTime()) {
                  const [, originalValue] = split;
                  retroWorkpackage.originalDuration = parseFloat(originalValue);
                  minDurationChangeDate = change.dateImplemented;
                }
                if (
                  split.length > 3 &&
                  (!maxDurationChangeDate || maxDurationChangeDate.getTime() < change.dateImplemented.getTime())
                ) {
                  const [, , , newValue] = split;
                  retroWorkpackage.duration = parseFloat(newValue);
                  maxDurationChangeDate = change.dateImplemented;
                }
              }
            } else if (
              change.detail.toLowerCase().includes('added start date') ||
              change.detail.toLowerCase().includes('changed start date')
            ) {
              const split = change.detail.split('"');
              if (split.length > 0) {
                if (!minStartChangeDate || minStartChangeDate.getTime() > change.dateImplemented.getTime()) {
                  const [, originalValue] = split;
                  retroWorkpackage.originalStartDate = new Date(originalValue);
                  minStartChangeDate = change.dateImplemented;
                }
                if (
                  split.length > 3 &&
                  (!maxStartChangeDate || maxStartChangeDate.getTime() < change.dateImplemented.getTime())
                ) {
                  const [, , , newValue] = split;
                  retroWorkpackage.startDate = new Date(newValue);
                  maxStartChangeDate = change.dateImplemented;
                }
              }
            }
          });
          return retroWorkpackage;
        })
      };
    });

    return retroProjects.map(retrospectiveProjectPreviewTransformer);
  }

  static async getRetrospectiveBudgets(organizationId: string): Promise<ProjectGantt[]> {
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
