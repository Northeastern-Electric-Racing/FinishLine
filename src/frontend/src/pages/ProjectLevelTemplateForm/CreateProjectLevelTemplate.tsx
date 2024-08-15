import { useCreateSingleProjectLevelTemplate } from '../../hooks/work-packages.hooks';
import ProjectLevelTemplateForm from './ProjectLevelTemplateForm';

const CreateProjectLevelTemplate: React.FC = () => {
  const { mutateAsync } = useCreateSingleProjectLevelTemplate();

  return <ProjectLevelTemplateForm mutateAsync={mutateAsync} />;
};

export default CreateProjectLevelTemplate;
