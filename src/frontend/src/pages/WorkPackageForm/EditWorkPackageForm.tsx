import { WPFormType, WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';

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
      mutateAsync={mutateAsync}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
      formType={WPFormType.Edit}
    />
  );
};

export default EditWorkPackageForm;
