import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync, isLoading } = useEditWorkPackage(wbsNum);
  const { isLoading: createStandardCRIsloading, mutateAsync: createStandardCr } = useCreateStandardChangeRequest();

  if (isLoading || createStandardCRIsloading) return <LoadingIndicator />;

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      mutateAsync={mutateAsync}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
      createStandardCr={createStandardCr}
    />
  );
};

export default EditWorkPackageForm;
