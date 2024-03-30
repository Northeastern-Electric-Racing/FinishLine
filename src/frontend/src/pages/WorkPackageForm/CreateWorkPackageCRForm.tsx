import { WbsNumber } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';

interface CreateWorkPackageCrProps {
  wbsNum: WbsNumber;
}

const CreateWorkPackageCRForm: React.FC<CreateWorkPackageCrProps> = ({ wbsNum }) => {
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');

  const { mutateAsync } = useCreateSingleWorkPackage();

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      mutateAsync={mutateAsync}
      exitActiveMode={() => history.push(`${routes.CHANGE_REQUESTS}`)}
      createForm
      createCR
    />
  );
};

export default CreateWorkPackageCRForm;
