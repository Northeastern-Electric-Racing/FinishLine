import { useEditWorkPackageTemplate, useSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageTemplateFormViewPayload as WorkPackageTemplateFormInputs } from './WorkPackageTemplateFormView';
import LoadingIndicator from '../../components/LoadingIndicator';

const EditWorkPackageTemplate: React.FC = () => {
  const query = useQuery();

  const workPackageTemplateId = query.get('workPackageTemplateId');

  const { mutateAsync: editWorkPackageTemplate } = useEditWorkPackageTemplate(workPackageTemplateId!);

  const { data: workPackageTemplate } = useSingleWorkPackageTemplate(workPackageTemplateId!);

  if (!workPackageTemplate) return <LoadingIndicator />;

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
