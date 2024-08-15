import { useCreateSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import ProjectLevelTemplateForm from './ProjectLevelTemplateForm';

const CreateProjectLevelTemplate: React.FC = () => {
  const { mutateAsync } = useCreateSingleWorkPackageTemplate();

  return <ProjectLevelTemplateForm mutateAsync={mutateAsync} />;
};

export default CreateProjectLevelTemplate;
