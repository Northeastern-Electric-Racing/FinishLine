/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { isProject, validateWBS, WbsNumber } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateWPFormView from './CreateWPFormView';
import { useQuery } from '../../hooks/utils.hooks';
import { mapBulletsToPayload } from '../../utils/form';

const CreateWPForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();
  const query = useQuery();

  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading) return <LoadingIndicator />;

  const handleSubmit = async (data: any) => {
    const { name, startDate, duration, crId, dependencies } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities, true);
    const deliverables = mapBulletsToPayload(data.deliverables, true);

    console.log(expectedActivities);
    console.log(deliverables);

    // exits handleSubmit if form input invalid (should be changed in wire up)
    let wbsNum: WbsNumber;
    try {
      wbsNum = validateWBS(query.get('wbs') ?? '');

      const { userId } = auth.user!;

      if (!isProject(wbsNum)) {
        alert('Please enter a valid Project WBS Number.');
        return;
      }
      const depWbsNums = dependencies.map((dependency: any) => {
        const depWbsNum = validateWBS(dependency.wbsNum);
        return {
          carNumber: depWbsNum.carNumber,
          projectNumber: depWbsNum.projectNumber,
          workPackageNumber: depWbsNum.workPackageNumber
        };
      });
      const createdWbsNum = await mutateAsync({
        userId,
        name: name.trim(),
        crId: parseInt(crId),
        projectWbsNum: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber
        },
        startDate,
        duration,
        dependencies: depWbsNums,
        expectedActivities,
        deliverables
      });
      history.push(`${routes.PROJECTS}/${createdWbsNum}`);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  return (
    <CreateWPFormView onSubmit={handleSubmit} onCancel={() => history.goBack()} allowSubmit={auth.user?.role !== 'GUEST'} />
  );
};

export default CreateWPForm;
