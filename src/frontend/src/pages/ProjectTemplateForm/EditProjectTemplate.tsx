import { useEditProjectTemplate, useSingleProjectTemplate } from '../../hooks/wbs-templates.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import ProjectTemplateForm from './ProjectTemplateForm';
import { ProjectTemplateApiInputs } from '../../apis/wbs-templates.api';

const EditProjectTemplate: React.FC = () => {
  const query = useQuery();

  const projectTemplateId = query.get('id');

  const { mutateAsync: editProjectTemplate } = useEditProjectTemplate(projectTemplateId!);

  const { data: projectTemplate, isLoading, isError, error } = useSingleProjectTemplate(projectTemplateId!);

  if (!projectTemplate || isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error.message} />;

  projectTemplate.workPackageTemplates = projectTemplate.workPackageTemplates ?? [];

  const defaultValues: ProjectTemplateApiInputs = {
    ...projectTemplate,
    workPackageTemplates: projectTemplate.workPackageTemplates.map((template) => ({
      ...template,
      duration: template.duration ?? undefined,
      blockedBy: template.blockedBy.map((blockedBy) => blockedBy.workPackageTemplateId)
    }))
  };

  return <ProjectTemplateForm projectTemplateMutateAsync={editProjectTemplate} defaultValues={defaultValues} />;
};

export default EditProjectTemplate;
