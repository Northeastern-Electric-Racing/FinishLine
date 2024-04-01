import { validateWBS } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { WPFormType } from '../../utils/form';

const CreateWorkPackageCRForm: React.FC = () => {
  const query = useQuery();
  const wbsNum = query.get('wbs');
  const history = useHistory();

  if (!wbsNum) throw new Error('WBS number not included in request.');

  const onSubmit = (payload: WorkPackageApiInputs) => {
    console.log('submitted');
  };

  return (
    <WorkPackageForm
      wbsNum={validateWBS(wbsNum)}
      mutateAsync={onSubmit}
      exitActiveMode={() => history.push(`${routes.CHANGE_REQUESTS}`)}
      formType={WPFormType.CREATEWITHCR}
    />
  );
};

export default CreateWorkPackageCRForm;
