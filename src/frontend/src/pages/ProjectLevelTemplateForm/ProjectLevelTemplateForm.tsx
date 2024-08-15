import { ProjectLevelTemplateApiInputs } from '../../apis/work-packages.api';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import ProjectLevelTemplateFormView, { ProjectLevelTemplateFormViewPayload } from './ProjectLevelTemplateFormView';

interface ProjectLevelTemplateFormProps {
  templateId?: string;
  mutateAsync: (_: ProjectLevelTemplateApiInputs) => void;
  defaultValues?: ProjectLevelTemplateFormViewPayload;
}

const ProjectLevelTemplateForm: React.FC<ProjectLevelTemplateFormProps> = ({ mutateAsync, defaultValues }) => {
  const smallTemplateSchema = yup.object().shape({
    workPackageName: yup.string().required('Work package name is required'),
    durationWeeks: yup.number().positive('Duration must be positive').required('Duration is required'),
    stage: yup.string().required('Work package stage is required'),
    blockedBy: yup.array().of(yup.string())
  });

  const schema = yup.object().shape({
    templateName: yup.string().required(),
    templateNotes: yup.string().required(),
    smallTemplates: yup.array().of(smallTemplateSchema)
  });

  const history = useHistory();

  return (
    <ProjectLevelTemplateFormView
      mutateAsync={mutateAsync}
      defaultValues={defaultValues}
      schema={schema}
      exitActiveMode={() => history.goBack()}
    />
  );
};

export default ProjectLevelTemplateForm;
