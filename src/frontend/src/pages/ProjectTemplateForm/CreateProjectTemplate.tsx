import { useCreateProjectTemplate } from '../../hooks/wbs-templates.hooks';
import ProjectTemplateForm from './ProjectTemplateForm';

const CreateProjectTemplate: React.FC = () => {
  const { mutateAsync: createProjectTemplate } = useCreateProjectTemplate();

  return <ProjectTemplateForm projectTemplateMutateAsync={createProjectTemplate} />;
};

export default CreateProjectTemplate;
