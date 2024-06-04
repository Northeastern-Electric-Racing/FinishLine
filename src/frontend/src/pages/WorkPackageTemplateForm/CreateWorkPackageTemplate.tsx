import { validateWBS } from 'shared';
import { useQuery } from '../../hooks/utils.hooks';
import { useCreateSingleWorkPackage, useCreateSingleWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { projectWbsNamePipe, projectWbsPipe } from '../../utils/pipes';
import { startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useSingleProject } from '../../hooks/projects.hooks';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';

const CreateWorkPackageTemplate: React.FC = () => {
  const history = useHistory()

  const { mutateAsync: createWorkPackageTemplateScopeCR } = useCreateSingleWorkPackageTemplate();


  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required()
  });
  return (
    <WorkPackageTemplateForm
      workPackageTemplateMutateAsync={createWorkPackageTemplateScopeCR}
      exitActiveMode={() => history.push(routes.ADMIN_TOOLS)}
      schema={schema} breadcrumbs={[]}    />
  );
};

export default CreateWorkPackageTemplate;
