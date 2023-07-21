import { Project, WbsNumber } from 'shared';

export const getAllWbsElements = (projects: Project[]): { wbsNum: WbsNumber; wbsName: string }[] => {
  return projects
    .map((project) => {
      return {
        wbsNum: project.wbsNum,
        wbsName: project.name
      };
    })
    .concat(
      projects.flatMap((project) =>
        project.workPackages.map((workPackage) => {
          return {
            wbsNum: workPackage.wbsNum,
            wbsName: workPackage.projectName + ' - ' + workPackage.name
          };
        })
      )
    );
};
