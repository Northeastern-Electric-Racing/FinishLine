import { validateWBS } from 'shared';
import { useQuery } from '../../hooks/utils.hooks';
import WorkPackageForm from './WorkPackageForm';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { projectWbsNamePipe, projectWbsPipe } from '../../utils/pipes';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useSingleProject } from '../../hooks/projects.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';

const CreateWorkPackageForm: React.FC = () => {
  const query = useQuery();
  const crId = query.get('crId');
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');

  const { mutateAsync: createWorkPackage } = useCreateSingleWorkPackage();
  const { mutateAsync: createWorkPackageScopeCR } = useCreateStandardChangeRequest();
  const { data: wbsElement, isLoading, isError, error } = useSingleProject(validateWBS(wbsNum));

  if (isLoading || !wbsElement) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup.date().required('Start Date is required!'),
    duration: yup.number().required()
  });

  const createWorkPackageWrapper = (workPackageInput: WorkPackageApiInputs) =>
    createWorkPackage({ ...workPackageInput, projectWbsNum: wbsElement.wbsNum });

  const breadcrumbs =
    crId && crId !== 'null'
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
      workPackageMutateAsync={createWorkPackageWrapper}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
      createLeadershipCR={() => {}} // leadership changes can't happen on creation
      exitActiveMode={() => history.push(`${routes.PROJECTS}/${projectWbsPipe(validateWBS(wbsNum))}`)}
      crId={crId && crId !== 'null' ? crId : undefined}
      schema={schema}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default CreateWorkPackageForm;
