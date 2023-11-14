import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  stateFunction: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, stateFunction }) => {
  const history = useHistory();

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      operation={useEditWorkPackage}
      exitActiveMode={() => {
        stateFunction(false);
        history.push(`${history.location.pathname}`);
      }}
    />
  );
};

export default EditWorkPackageForm;
