import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { MutationFunction } from 'react-query';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync, isLoading } = useEditWorkPackage(wbsNum);

  if (isLoading) return <LoadingIndicator />;

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      mutateAsync={mutateAsync as MutationFunction}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
    />
  );
};

export default EditWorkPackageForm;
