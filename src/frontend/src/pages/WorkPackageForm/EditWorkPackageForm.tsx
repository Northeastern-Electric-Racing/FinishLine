import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { WPFormType, startDateTester } from '../../utils/form';
import * as yup from 'yup';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync, isLoading } = useEditWorkPackage(wbsNum);

  if (isLoading) return <LoadingIndicator />;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required(),
    crId: yup
      .number()
      .required('CR ID is required')
      .typeError('CR ID must be a number')
      .integer('CR ID must be an integer')
      .min(1, 'CR ID must be greater than or equal to 1')
  });

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      mutateAsync={mutateAsync}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
      formType={WPFormType.EDIT}
      schema={schema}
    />
  );
};

export default EditWorkPackageForm;
