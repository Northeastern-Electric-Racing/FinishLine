import { validateWBS } from 'shared';
import { useQuery } from '../../hooks/utils.hooks';
import WorkPackageForm from './WorkPackageForm';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { projectWbsPipe } from '../../utils/pipes';
import { WPFormType, startDateTester } from '../../utils/form';
import * as yup from 'yup';

const CreateWorkPackageForm: React.FC = () => {
  const query = useQuery();
  const crId = query.get('crId');
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');
  if (!crId) throw new Error('CR ID not included in request.');

  const { mutateAsync } = useCreateSingleWorkPackage();

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
      wbsNum={validateWBS(wbsNum)}
      mutateAsync={mutateAsync}
      exitActiveMode={() => history.push(`${routes.PROJECTS}/${projectWbsPipe(validateWBS(wbsNum))}`)}
      crId={crId}
      formType={WPFormType.CREATE}
      schema={schema}
    />
  );
};

export default CreateWorkPackageForm;
