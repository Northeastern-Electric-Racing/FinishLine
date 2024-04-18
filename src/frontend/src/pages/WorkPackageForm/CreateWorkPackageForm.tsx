import { validateWBS } from 'shared';
import { useQuery } from '../../hooks/utils.hooks';
import WorkPackageForm from './WorkPackageForm';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { projectWbsPipe } from '../../utils/pipes';

const CreateWorkPackageForm: React.FC = () => {
  const query = useQuery();
  const crId = query.get('crId');
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');
  if (!crId) throw new Error('CR ID not included in request.');

  const { mutateAsync } = useCreateSingleWorkPackage();
  
  return (
    <WorkPackageForm
      wbsNum={validateWBS(wbsNum)}
      mutateAsync={mutateAsync}
      exitActiveMode={() => history.push(`${routes.PROJECTS}/${projectWbsPipe(validateWBS(wbsNum))}`)}
      crId={crId}
      createForm
    />
  );
};

export default CreateWorkPackageForm;
