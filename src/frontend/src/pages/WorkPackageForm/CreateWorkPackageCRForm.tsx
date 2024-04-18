import { ChangeRequestReason, ChangeRequestType, validateWBS } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useQuery } from '../../hooks/utils.hooks';
import { CreateWorkPackageApiInputs } from '../../apis/work-packages.api';
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
  const onSubmit = async (payload: CreateWorkPackageApiInputs) => {
    const crPayload = {
      submitter: currentUser,
      wbsNum: validateWBS(wbsNum),
      type: ChangeRequestType.Issue,
      what: payload.name,
      why: [{ explain: 'explination', type: ChangeRequestReason.Competition }],
      proposedSolutions: [],
      workPackageProposedChanges: {
        name: payload.name,
        status: payload.status,
        projectLeadId: payload.projectLeadId,
        projectManagerId: payload.projectManagerId,
        links: payload.links,
        duration: payload.duration,
        startDate: payload.startDate,
        stage: payload.stage,
        blockedBy: payload.blockedBy,
        expectedActivities: payload.expectedActivities,
        deliverables: payload.deliverables
      }
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
