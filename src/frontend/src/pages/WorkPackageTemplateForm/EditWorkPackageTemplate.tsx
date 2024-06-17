import { useEditWorkPackageTemplate, useSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';
import { useQuery } from '../../hooks/utils.hooks';
import { useHistory } from 'react-router-dom';

const EditWorkPackageTemplate: React.FC = () => {

  const query = useQuery();

  const workPackageTemplateId = query.get('workPackageTemplateId');

  const { mutateAsync: editWorkPackageTemplate } = useEditWorkPackageTemplate(workPackageTemplateId!);

  const { data: workPackageTemplate } = useSingleWorkPackageTemplate(workPackageTemplateId!)

  const defaultValues = {
    ...workPackageTemplate,
    workPackageName: workPackageTemplate?.workPackageName,
    templateName: workPackageTemplate?.templateName,
    workPackageTemplateId: workPackageTemplate?.workPackageTemplateId,
    duration: workPackageTemplate?.duration,
    descriptionBullets: workPackageTemplate?.descriptionBullets,
    stage: workPackageTemplate!.stage ?? 'NONE',
    blockedBy:
      workPackageTemplate?.blockedBy
        .filter((wp) => wp.workPackageTemplateId !== workPackageTemplateId)
        .map((wp) => ({
          id: wp.workPackageTemplateId,
           label: `${wp.templateName}`
        })) || []
  };

  return (
    <WorkPackageTemplateForm
      workPackageTemplateId={workPackageTemplateId!}
      workPackageTemplateMutateAsync={editWorkPackageTemplate}
    />
  );
};

export default EditWorkPackageTemplate;
