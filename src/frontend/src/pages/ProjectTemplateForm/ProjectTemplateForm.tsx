import { useHistory } from 'react-router-dom';
import { ProjectTemplateApiInputs } from '../../apis/wbs-templates.api';
import ProjectTemplateFormView from './ProjectTemplateFormView';
import * as yup from 'yup';
import { workPackageTemplateSchema } from '../WorkPackageTemplateForm/WorkPackageTemplateForm';

interface ProjectTemplateFormProps {
  projectTemplateMutateAsync: (data: ProjectTemplateApiInputs) => void;
  defaultValues?: ProjectTemplateApiInputs;
}

const ProjectTemplateForm: React.FC<ProjectTemplateFormProps> = ({ projectTemplateMutateAsync, defaultValues }) => {
  const history = useHistory();

  const schema = yup.object().shape({
    projectName: yup.string().optional(),
    templateName: yup.string().required('Template Name is required'),
    templateNotes: yup.string().required('Template Notes are required'),
    workPackageTemplates: yup.array().of(workPackageTemplateSchema)
  });

  return (
    <ProjectTemplateFormView
      exitActiveMode={() => {
        history.goBack();
      }}
      projectTemplateMutateAsync={projectTemplateMutateAsync}
      defaultValues={defaultValues}
      schema={schema}
    />
  );
};

export default ProjectTemplateForm;
