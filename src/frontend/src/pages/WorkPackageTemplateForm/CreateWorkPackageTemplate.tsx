import { useCreateSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';

const CreateWorkPackageTemplate: React.FC = () => {

  const { mutateAsync: createWorkPackageTemplateScopeCR } = useCreateSingleWorkPackageTemplate();

  return (
    <WorkPackageTemplateForm
      workPackageTemplateMutateAsync={createWorkPackageTemplateScopeCR}
    />
  );
};

export default CreateWorkPackageTemplate;
