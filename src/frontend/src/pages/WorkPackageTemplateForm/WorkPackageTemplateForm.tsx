import React from 'react';
import ErrorPage from '../ErrorPage';
import { useAllWorkPackageTemplates } from '../../hooks/projects.hooks';
import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import WorkPackageTemplateFormView, { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { useSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';

interface WorkPackageTemplateFormProps {
  workPackageTemplateId?: string;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  defaultValues?: WorkPackageTemplateFormViewPayload;
}

const WorkPackageTemplateForm: React.FC<WorkPackageTemplateFormProps> = ({
  workPackageTemplateId,
  workPackageTemplateMutateAsync,
  defaultValues
}) => {
  const { data: workPackageTemplates, isError: wpIsError, error: wpError } = useAllWorkPackageTemplates();

  const history = useHistory();

  const schema = yup.object().shape({
    workPackageName: yup.string().required('Name is required!'),
    duration: yup.number().required()
  });

  if (wpIsError) return <ErrorPage message={wpError.message} />;

  const blockedByOptions =
    workPackageTemplates
      ?.filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId)
      .map((wp) => ({
        id: wp.workPackageTemplateId,
        label: `${wp.templateName}`
      })) || [];

  return (
    <WorkPackageTemplateFormView
      exitActiveMode={() => history.goBack()}
      workPackageTemplateMutateAsync={workPackageTemplateMutateAsync}
      defaultValues={defaultValues}
      blockedByOptions={blockedByOptions}
      schema={schema}
    />
  );
};

export default WorkPackageTemplateForm;
