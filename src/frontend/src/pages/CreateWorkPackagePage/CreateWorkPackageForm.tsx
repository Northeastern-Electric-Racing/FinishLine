/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { useToast } from '../../hooks/toasts.hooks';
import { isGuest, isProject, validateWBS, WorkPackageStage } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateWorkPackageFormView from './CreateWorkPackageFormView';
import { CreateWorkPackageApiInputs } from '../../apis/work-packages.api';

export interface CreateWorkPackageFormInputs {
  name: string;
  startDate: Date;
  duration: number | null;
  crId: number;
  stage: WorkPackageStage | 'None';
  wbsNum: string;
  blockedBy: { wbsNum: string }[];
  expectedActivities: { bulletId: number; detail: string }[];
  deliverables: { bulletId: number; detail: string }[];
}

const CreateWorkPackageForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();
  const toast = useToast();

  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading || auth.user === undefined) return <LoadingIndicator />;

  const handleSubmit = async (data: CreateWorkPackageFormInputs) => {
    const { name, startDate, duration, crId, blockedBy, wbsNum, stage } = data;
    const expectedActivities = data.expectedActivities.map((bullet: { bulletId: number; detail: string }) => bullet.detail);
    const deliverables = data.deliverables.map((bullet: { bulletId: number; detail: string }) => bullet.detail);

    if (!duration) {
      toast.error('Please enter a valid duration!', 3000);
      return;
    }

    try {
      const wbsNumValidated = validateWBS(wbsNum);

      if (!isProject(wbsNumValidated)) {
        toast.error('Please enter a valid Project WBS Number.', 3000);
        return;
      }

      const blockedByWbsNums = blockedBy.map((blocker: { wbsNum: string }) => {
        const blockedWbsNum = validateWBS(blocker.wbsNum);
        return {
          carNumber: blockedWbsNum.carNumber,
          projectNumber: blockedWbsNum.projectNumber,
          workPackageNumber: blockedWbsNum.workPackageNumber
        };
      });

      const payload: CreateWorkPackageApiInputs = {
        name: name.trim(),
        crId,
        projectWbsNum: {
          carNumber: wbsNumValidated.carNumber,
          projectNumber: wbsNumValidated.projectNumber,
          workPackageNumber: wbsNumValidated.workPackageNumber
        },
        startDate,
        duration,
        blockedBy: blockedByWbsNums,
        expectedActivities,
        deliverables,
        stage: stage === 'None' ? null : stage
      };

      const createdWbsNum = await mutateAsync(payload);
      history.push(`${routes.PROJECTS}/${createdWbsNum}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  return (
    <CreateWorkPackageFormView
      onSubmit={handleSubmit}
      onCancel={() => history.goBack()}
      allowSubmit={!isGuest(auth.user.role)} wbsNum={''} setWbsNum={function (val: string): void {
        throw new Error('Function not implemented.');
      } }    />
  );
};

export default CreateWorkPackageForm;
