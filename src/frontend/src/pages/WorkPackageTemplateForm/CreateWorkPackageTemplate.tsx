import { useCreateSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import * as yup from 'yup';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';

const CreateWorkPackageTemplate: React.FC = () => {
  const history = useHistory();

  const { mutateAsync: createWorkPackageTemplateScopeCR } = useCreateSingleWorkPackageTemplate();

  const schema = yup.object().shape({
    workPackageName: yup.string().required('Name is required!'),
    duration: yup.number().required()
  });
  return (
    <WorkPackageTemplateForm
      workPackageTemplateMutateAsync={createWorkPackageTemplateScopeCR}
      exitActiveMode={() => history.push(routes.ADMIN_TOOLS)}
      schema={schema}
    />
  );
};

export default CreateWorkPackageTemplate;
