import { ChangeRequestType, WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage, useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { useToast } from '../../hooks/toasts.hooks';

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

  const { expectedActivities, deliverables, status, links } = wp;

  const onSubmitCreateCr = async (data: WorkPackageApiInputs) => {
    const { name, startDate, duration, stage, blockedBy } = data;

    try {
      await createCrMutateAsync({
        wbsNum: wbsNum,
        type: ChangeRequestType.Other,
        what: '',
        why: [],
        proposedSolutions: [],
        workPackageProposedChanges: {
          duration: duration,
          startDate: startDate.toString(),
          stage: stage,
          blockedBy: blockedBy,
          name: name,
          expectedActivities: expectedActivities.map((e) => e.detail),
          deliverables: deliverables.map((d) => d.detail),
          status: status,
          links: links.map(l => ({ url: l.url, linkTypeName: l.linkType.name }))
        }
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
      createCrSubmit={onSubmitCreateCr}
    />
  );
};

export default EditWorkPackageForm;
