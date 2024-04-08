import { validateWBS } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { WPFormType, startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { getCurrentUser } from '../../../../backend/src/utils/auth.utils';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';

const CreateWorkPackageCRForm: React.FC = () => {
  const query = useQuery();
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');

  const {mutateAsync} = useCreateStandardChangeRequest();

  const onSubmit = (payload: WorkPackageApiInputs) => {
    const crPayload = {
      submitter: getCurrentUser(),
      carNumber: 1, // harcoded example
      projectNumber: 2, // harcoded example
      workPackageNumber: 3, // harcoded example
      type: CR_Type.ISSUE, // harcoded example
      what: payload.name, // harcoded example
      why: { type: Scope_CR_Why_Type; explain: string }[], 
      proposedSolutions: [], // harcoded example
      ...payload  
    };

    await mutateAsync(crPayload);
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required()
  });

  return (
    <WorkPackageForm
      wbsNum={validateWBS(wbsNum)}
      mutateAsync={onSubmit}
      exitActiveMode={() => history.push(`${routes.CHANGE_REQUESTS}`)}
      formType={WPFormType.CREATEWITHCR}
      schema={schema}
    />
  );
};

export default CreateWorkPackageCRForm;
