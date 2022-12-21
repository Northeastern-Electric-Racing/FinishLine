/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { isProject, validateWBS } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateWPFormView from './CreateWPFormView';

const CreateWPForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();

  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading) return <LoadingIndicator />;

  const handleSubmit = async (data: any) => {
    const { name, startDate, duration, crId, dependencies, wbsNum } = data;
    const expectedActivities = data.expectedActivities.map((bullet: { bulletId: number; detail: string }) => bullet.detail);
    const deliverables = data.deliverables.map((bullet: { bulletId: number; detail: string }) => bullet.detail);

    // exits handleSubmit if form input invalid (should be changed in wire up)
    try {
      const wbsNumValidated = validateWBS(wbsNum);

      const { userId } = auth.user!;

      if (!isProject(wbsNumValidated)) {
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
          carNumber: wbsNumValidated.carNumber,
          projectNumber: wbsNumValidated.projectNumber,
          workPackageNumber: wbsNumValidated.workPackageNumber
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
