import { ProjectLevelTemplate, WbsElement, wbsPipe, WorkPackageTemplate } from 'shared';
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
 * Produces an array in which individual templates are preserved and ones belonging to project-level templates are grouped together
 * Preserves order and runs in O(n) time
 * @param templates the templates to group
 * @returns the array with grouped templates
 */
export const groupProjectLevelTemplates = (
  templates: WorkPackageTemplate[]
): (WorkPackageTemplate | ProjectLevelTemplate)[] => {
  const templateMap = new Map<string, WorkPackageTemplate[]>();

  templates.forEach((template) => {
    templateMap.set(
      template.templateName,
      templateMap.has(template.templateName) ? [...templateMap.get(template.templateName)!, template] : [template]
    );
  });

  const returnArray = [] as (WorkPackageTemplate | ProjectLevelTemplate)[];
  const seenProjectLevels = new Set<string>();

  templates.forEach((template) => {
    if (templateMap.get(template.templateName)?.length === 1) returnArray.push(template);
    else if (!seenProjectLevels.has(template.templateName)) {
      returnArray.push({
        templateName: template.templateName,
        templateNotes: template.templateNotes,
        smallTemplates: templateMap.get(template.templateName)!
      });
      seenProjectLevels.add(template.templateName);
    }
  });

  return returnArray;
};
