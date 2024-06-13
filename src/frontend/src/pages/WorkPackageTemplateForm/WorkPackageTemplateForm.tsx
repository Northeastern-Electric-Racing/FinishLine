import React from 'react';
import ErrorPage from '../ErrorPage';
import { useAllWorkPackageTemplates } from '../../hooks/projects.hooks';
import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import WorkPackageTemplateFormView, { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';

interface WorkPackageTemplateFormProps {
  workPackageTemplateId?: string;
  exitActiveMode: () => void;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  schema: ObjectSchema<any>;
}

const WorkPackageTemplateForm: React.FC<WorkPackageTemplateFormProps> = ({
  workPackageTemplateId,
  workPackageTemplateMutateAsync,
  exitActiveMode,
  schema
}) => {
  const { data: workPackageTemplates, isError: wpIsError, error: wpError } = useAllWorkPackageTemplates();

  if (wpIsError) return <ErrorPage message={wpError.message} />;

  let workPackageTemplate;
  let defaultValues: WorkPackageTemplateFormViewPayload | undefined;

  if (workPackageTemplateId) {
    workPackageTemplate = workPackageTemplates?.find((wpt) => wpt.workPackageTemplateId === workPackageTemplateId);

    if (workPackageTemplate) {
      defaultValues = {
        ...workPackageTemplate,
        workPackageName: workPackageTemplate.workPackageName,
        templateName: workPackageTemplate.templateName,
        workPackageTemplateId: workPackageTemplate.workPackageTemplateId,
        duration: workPackageTemplate.duration,
        descriptionBullets: workPackageTemplate.descriptionBullets,
        stage: workPackageTemplate!.stage ?? 'NONE',
        blockedBy:
          workPackageTemplate.blockedBy
            .filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId)
            .map((wp) => ({
              id: wp.workPackageTemplateId,
              label: `${wp.templateName}`
            })) || []
      };
    }
  }

  const blockedByOptions =
    workPackageTemplates
      ?.filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId)
      .map((wp) => ({
        id: wp.workPackageTemplateId,
        label: `${wp.templateName}`
      })) || [];

  return (
    <WorkPackageTemplateFormView
      exitActiveMode={exitActiveMode}
      workPackageTemplateMutateAsync={workPackageTemplateMutateAsync}
      defaultValues={defaultValues}
      blockedByOptions={blockedByOptions}
      schema={schema}
    />
  );
};

export default WorkPackageTemplateForm;
