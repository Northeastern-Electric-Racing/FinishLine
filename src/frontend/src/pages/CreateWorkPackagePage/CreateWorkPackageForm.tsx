/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { useToast } from '../../hooks/toasts.hooks';
import { isProject, validateWBS } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateWorkPackageFormView from './CreateWorkPackageFormView';
import { CreateWorkPackageFormInputs } from '../../apis/work-packages.api';



const CreateWorkPackageForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();
  const toast = useToast();

  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading || auth.user === undefined) return <LoadingIndicator />;

  const handleSubmit = async (data: CreateWorkPackageFormInputs) => {
    const { name, startDate, duration, crId, dependencies, wbsNum, stage } = data;
    const expectedActivities = data.expectedActivities.map((bullet: { bulletId: number; detail: string }) => bullet.detail);
    const deliverables = data.deliverables.map((bullet: { bulletId: number; detail: string }) => bullet.detail);

    // exits handleSubmit if form input invalid (should be changed in wire up)
    try {
      const wbsNumValidated = validateWBS(wbsNum);

      if (!isProject(wbsNumValidated)) {
        toast.error('Please enter a valid Project WBS Number.', 3000);
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
        name: name.trim(),
        crId: parseInt(crId),
        projectWbsNum: {
          carNumber: wbsNumValidated.carNumber,
          projectNumber: wbsNumValidated.projectNumber,
          workPackageNumber: wbsNumValidated.workPackageNumber
        },
        startDate: startDate.toLocaleDateString(),
        duration,
        dependencies: depWbsNums,
        expectedActivities,
        deliverables,
        stage
      });
      history.push(`${routes.PROJECTS}/${createdWbsNum}`);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  return (
    <CreateWorkPackageFormView
      onSubmit={handleSubmit}
      onCancel={() => history.goBack()}
      allowSubmit={auth.user.role !== 'GUEST'}
    />
  );
};

export default CreateWorkPackageForm;
