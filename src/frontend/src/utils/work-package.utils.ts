import { WbsElement, wbsPipe, WorkPackageTemplate } from 'shared';
import { WPFormType } from './form';

export const getTitleFromFormType = (formType: WPFormType, wbsElement: WbsElement): string => {
  switch (formType) {
    case WPFormType.CREATEWITHCR:
      return `Create Change Request - New Work Package - ${wbsElement.name}`;
    case WPFormType.CREATE:
      return `New Work Package - ${wbsElement.name}`;
    default:
      return `${wbsPipe(wbsElement.wbsNum)} - ${wbsElement.name}`;
  }
};

/**
 * Returns only templates not belonging to a project-level template
 * @param templates a list of work package templates
 */
export const getIndividualTemplates = (templates: WorkPackageTemplate[]): WorkPackageTemplate[] => {
  const nameCounts = new Map<string, number>();

  templates.forEach((template) =>
    nameCounts.set(
      template.templateName,
      nameCounts.has(template.templateName) ? nameCounts.get(template.templateName)! + 1 : 1
    )
  );

  return templates.filter((template) => nameCounts.get(template.templateName) === 1);
};
