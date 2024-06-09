import React from 'react';
import { WbsNumber, WorkPackage, isGuest, wbsPipe } from 'shared';
import { bulletsToObject } from '../../utils/form';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllUsers } from '../../hooks/users.hooks';
import { useAllWorkPackageTemplates, useSingleProject } from '../../hooks/projects.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs, WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import WorkPackageTemplateFormView, { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';

interface WorkPackageTemplateFormProps {
  workPackageTemplateId?: string; 
  exitActiveMode: () => void;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

const WorkPackageTemplateForm: React.FC<WorkPackageTemplateFormProps> = ({
  workPackageTemplateId,
  workPackageTemplateMutateAsync,
  exitActiveMode,
  schema,
  breadcrumbs
}) => {
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();
  const query = useQuery();

  const {
    data: workPackageTemplates,
    isLoading: wpIsLoading,
    isError: wpIsError,
    error: wpError
  } = useAllWorkPackageTemplates();

  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (wpIsError) return <ErrorPage message={wpError.message} />;

  let workPackageTemplate;
  let defaultValues: WorkPackageTemplateFormViewPayload | undefined;

  if (workPackageTemplateId) {
    workPackageTemplate = workPackageTemplates?.find(
      (wpt) =>
        wpt.workPackageTemplateId == workPackageTemplateId
    );

    console.log(workPackageTemplate)

    if (workPackageTemplate) {
      defaultValues = {
        ...workPackageTemplate,
        workPackageName: workPackageTemplate.workPackageName,
        templateName: workPackageTemplate.templateName,
        workPackageTemplateId: workPackageTemplate.workPackageTemplateId,
        duration: workPackageTemplate.duration,
        descriptionBullets: workPackageTemplate.descriptionBullets,
        stage: workPackageTemplate!.stage ?? 'NONE',
        blockedBy: workPackageTemplate.blockedBy.filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId).map((wp) => ({
          id: wp.workPackageTemplateId,
          label: `${wp.templateName}`
        })) || []
      };
    }
  }

  const blockedByOptions =
    (workPackageTemplates?.filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId).map((wp) => ({
      id: wp.workPackageTemplateId,
      label: `${wp.templateName}`
    })) || []);

  return (
    <WorkPackageTemplateFormView
      exitActiveMode={exitActiveMode}
      workPackageTemplateMutateAsync={workPackageTemplateMutateAsync}
      defaultValues={defaultValues}
      blockedByOptions={blockedByOptions}
      schema={schema}
      breadcrumbs={breadcrumbs}    />
  );
};

export default WorkPackageTemplateForm;
