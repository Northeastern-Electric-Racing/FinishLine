import { useEditWorkPackageTemplate, useSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageTemplateFormViewPayload as WorkPackageTemplateFormInputs } from './WorkPackageTemplateFormView';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const EditWorkPackageTemplate: React.FC = () => {
  const query = useQuery();

  const workPackageTemplateId = query.get('id');

  const { mutateAsync: editWorkPackageTemplate } = useEditWorkPackageTemplate(workPackageTemplateId!);

  const { data: workPackageTemplate, isLoading, isError, error } = useSingleWorkPackageTemplate(workPackageTemplateId!);

  if (!workPackageTemplate || isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error.message} />;

  const defaultValues: WorkPackageTemplateFormInputs = {
    ...workPackageTemplate,
    stage: workPackageTemplate?.stage ?? 'NONE',
    blockedBy:
      workPackageTemplate?.blockedBy.map((wp) => ({
        id: wp.workPackageTemplateId,
        label: `${wp.templateName}`
      })) || []
  };

  return (
    <WorkPackageTemplateForm
      workPackageTemplateId={workPackageTemplateId!}
      workPackageTemplateMutateAsync={editWorkPackageTemplate}
      defaultValues={defaultValues}
    />
  );
};

export default EditWorkPackageTemplate;
