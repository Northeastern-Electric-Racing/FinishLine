import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { routes } from '../../utils/routes';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync, isLoading } = useEditWorkPackage(wbsNum);
  const { mutateAsync: createWorkPackageScopeCR, isLoading: createStandardChangeRequestIsLoading } =
    useCreateStandardChangeRequest();

  if (isLoading || createStandardChangeRequestIsLoading) return <LoadingIndicator />;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required()
  });

  const breadcrumbs = [
    {
      name: 'Projects',
      route: `${routes.PROJECTS}`
    },
    {
      name: `Work Package ${wbsNum.workPackageNumber}`,
      route: `${routes.PROJECTS}/${wbsNum.projectNumber}/work-packages/${wbsNum.carNumber}/${wbsNum.projectNumber}/${wbsNum.workPackageNumber}`
    }
  ];

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      mutateAsync={mutateAsync}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
      schema={schema}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default EditWorkPackageForm;
