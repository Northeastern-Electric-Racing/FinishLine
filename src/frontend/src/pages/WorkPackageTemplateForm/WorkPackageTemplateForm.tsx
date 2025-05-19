import React from 'react';
import ErrorPage from '../ErrorPage';
import { useAllWorkPackageTemplates } from '../../hooks/projects.hooks';
import { WorkPackageTemplateApiInputs } from '../../apis/wbs-templates.api';
import WorkPackageTemplateFormView, { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';

interface WorkPackageTemplateFormProps {
  workPackageTemplateId?: string;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  defaultValues?: WorkPackageTemplateFormViewPayload;
}

export const workPackageTemplateSchema = yup.object().shape({
  workPackageName: yup
    .string()
    .transform((value) => (value ? value : undefined))
    .optional(),
  stage: yup.string().optional(),
  duration: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'Duration cannot be negative!')
    .integer()
    .optional(),
  templateName: yup.string().required('Template Name is required'),
  templateNotes: yup.string(),
  blockedBy: yup.array(),
  descriptionBullets: yup.array()
});

const WorkPackageTemplateForm: React.FC<WorkPackageTemplateFormProps> = ({
  workPackageTemplateId,
  workPackageTemplateMutateAsync,
  defaultValues
}) => {
  const { data: workPackageTemplates, isError: wpIsError, error: wpError } = useAllWorkPackageTemplates();

  const history = useHistory();

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
      schema={workPackageTemplateSchema}
    />
  );
};

export default WorkPackageTemplateForm;
