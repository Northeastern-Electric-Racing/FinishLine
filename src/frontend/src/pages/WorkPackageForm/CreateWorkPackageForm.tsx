import { validateWBS } from 'shared';
import { useQuery } from '../../hooks/utils.hooks';
import WorkPackageForm from './WorkPackageForm';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { projectWbsNamePipe, projectWbsPipe } from '../../utils/pipes';
import { startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useSingleProject } from '../../hooks/projects.hooks';

const CreateWorkPackageForm: React.FC = () => {
  const query = useQuery();
  const crId = query.get('crId');
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');
  if (!crId) throw new Error('CR ID not included in request.');

  const { mutateAsync } = useCreateSingleWorkPackage();
  const { mutateAsync: createWorkPackageScopeCR } = useCreateStandardChangeRequest();
  const { data: wbsElement, isLoading, isError, error } = useSingleProject(validateWBS(wbsNum));

  if (isLoading || !wbsElement) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required()
  });

  const breadcrumbs = crId
    ? [
        {
          name: 'Change Requests',
          route: routes.CHANGE_REQUESTS
        },
        {
          name: `Change Request #${crId}`,
          route: `${routes.CHANGE_REQUESTS}/${crId}`
        }
      ]
    : [
        {
          name: 'Projects',
          route: routes.PROJECTS
        },
        {
          name: `${projectWbsNamePipe(wbsElement)}`,
          route: `${routes.PROJECTS}/${projectWbsPipe(wbsElement.wbsNum)}`
        }
      ];
  return (
    <WorkPackageForm
      wbsNum={validateWBS(wbsNum)}
      mutateAsync={mutateAsync}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
      exitActiveMode={() => history.push(`${routes.PROJECTS}/${projectWbsPipe(validateWBS(wbsNum))}`)}
      crId={crId}
      schema={schema}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default CreateWorkPackageForm;
