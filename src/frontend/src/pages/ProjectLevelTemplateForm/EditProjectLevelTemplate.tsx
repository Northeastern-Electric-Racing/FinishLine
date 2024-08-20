import LoadingIndicator from '../../components/LoadingIndicator';
import { useQuery } from '../../hooks/utils.hooks';
import { useEditProjectLevelTemplate, useProjectLevelTemplateByName } from '../../hooks/work-packages.hooks';
import ErrorPage from '../ErrorPage';
import ProjectLevelTemplateForm from './ProjectLevelTemplateForm';
import { ProjectLevelTemplateFormViewPayload } from './ProjectLevelTemplateFormView';

const EditProjectLevelTemplate: React.FC = () => {
  const query = useQuery();

  const templateName = query.get('templateName');

  const { data: template, isLoading, isError, error } = useProjectLevelTemplateByName(templateName!);

  const { mutateAsync } = useEditProjectLevelTemplate(templateName!);

  if (!template || isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error.message} />;

  template.smallTemplates.forEach((template) => console.log('foo' + template.duration));

  const defaultValues: ProjectLevelTemplateFormViewPayload = {
    templateName: template.templateName,
    templateNotes: template.templateNotes,
    smallTemplates: template.smallTemplates.map((smallTemplate) => {
      return {
        stage: smallTemplate.stage ?? 'NONE',
        workPackageName: smallTemplate.workPackageName!,
        templateId: smallTemplate.workPackageTemplateId,
        durationWeeks: smallTemplate.duration!,
        blockedBy: smallTemplate.blockedBy.map((blocker) => blocker.workPackageTemplateId)
      };
    })
  };

  return <ProjectLevelTemplateForm mutateAsync={mutateAsync} defaultValues={defaultValues} />;
};

export default EditProjectLevelTemplate;
