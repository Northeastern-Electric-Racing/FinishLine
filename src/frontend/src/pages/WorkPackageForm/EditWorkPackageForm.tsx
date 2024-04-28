import { ChangeRequestType, WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage, useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { WPFormType, startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { useToast } from '../../hooks/toasts.hooks';
import { WpCreateChangeRequestFormInput } from './CreateWpChangeRequestForm';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, setPageMode }) => {
  const history = useHistory();
  const toast = useToast();

  const { mutateAsync, isLoading } = useEditWorkPackage(wbsNum);
  const { mutateAsync: createCrMutateAsync } = useCreateStandardChangeRequest();
  const { data: wp, isLoading: isLoadingWp } = useSingleWorkPackage(wbsNum);

  if (isLoading || isLoadingWp || !wp) return <LoadingIndicator />;

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

  const { expectedActivities, deliverables } = wp;

  const onSubmitCreateCr = async (data: WpCreateChangeRequestFormInput) => {
    const { name, startDate, duration, stage, blockedBy } = data;

    try {
      await createCrMutateAsync({
        wbsNum: wbsNum,
        type: ChangeRequestType.Other,
        what: '',
        why: [],
        proposedSolutions: [],
        // workPackageProposedChanges: {
        //   duration: duration,
        //   startDate: startDate.toString(),
        //   stage: stage,
        //   blockedBy: blockedBy,
        //   name: name,
        //   expectedActivities: expectedActivities.map((e) => e.detail),
        //   deliverables: deliverables.map((d) => d.detail)
        // }
      });
      setPageMode(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

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
      createCrSubmit={onSubmitCreateCr}
    />
  );
};

export default EditWorkPackageForm;
