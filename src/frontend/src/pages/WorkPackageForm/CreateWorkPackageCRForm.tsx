import { ChangeRequestType, validateWBS } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { WPFormType, startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';

const CreateWorkPackageCRForm: React.FC = () => {
  const query = useQuery();
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');

  const { mutateAsync } = useCreateStandardChangeRequest();

  const currentUser = useCurrentUser();
  const onSubmit = (payload: WorkPackageApiInputs) => {
    const crPayload = {
      submitter: currentUser,
      carNumber: wbsNum.substring(0, 1),
      projectNumber: wbsNum.substring(2, 3),
      workPackageNumber: wbsNum.substring(4, 5),
      type: ChangeRequestType.Issue,
      what: payload.name,
      why: { type: 'DESIGN', explain: 'explination' },
      proposedSolutions: [],
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
