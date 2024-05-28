import React from 'react';
import { WbsNumber, WorkPackage, isGuest, wbsPipe } from 'shared';
import WorkPackageFormView, { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';
import { bulletsToObject } from '../../utils/form';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllUsers } from '../../hooks/users.hooks';
import { useAllWorkPackageTemplates, useSingleProject } from '../../hooks/projects.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import WorkPackageTemplateFormView from './WorkPackageTemplateFormView';

interface WorkPackageFormProps {
  workPackageTemplateId?: string; 
  exitActiveMode: () => void;
  workPackageMutateAsync: (data: WorkPackageApiInputs) => void;
  createWorkPackageScopeCR: (data: CreateStandardChangeRequestPayload) => void;
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

const WorkPackageForm: React.FC<WorkPackageFormProps> = ({
  workPackageTemplateId,
  workPackageMutateAsync,
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

    if (workPackageTemplate) {
      defaultValues = {
        ...workPackageTemplate,
        name: workPackageTemplate.workPackageName,
        workPackageTemplateId: workPackageTemplate.workPackageTemplateId,
        duration: workPackageTemplate.duration,
        stage: workPackageTemplate!.stage ?? 'NONE',
        blockedBy: workPackageTemplate.blockedBy.map((workPackageId) => workPackageId)
      };
    }
  }


  const leadOrManagerOptions = users?.filter((user) => !isGuest(user.role));
  const blockedByOptions =
    (workPackageTemplates?.filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId).map((wp) => ({
      id: wp.workPackageTemplateId,
      label: `${(wp.workPackageTemplateId)} - ${wp.workPackageName}`
    })) || []);

  return (
    <WorkPackageTemplateFormView
      exitActiveMode={exitActiveMode}
      workPackageTemplateMutateAsync={workPackageMutateAsync}
      defaultValues={defaultValues}
      blockedByOptions={blockedByOptions}
      schema={schema}
      breadcrumbs={breadcrumbs}    />
  );
};

export default WorkPackageForm;
