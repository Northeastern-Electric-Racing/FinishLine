/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestReason, ChangeRequestType, ProposedSolution, validateWBS } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateProposeSolution, useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateChangeRequestsView from './CreateChangeRequestView';
import { useState } from 'react';
import { useToast } from '../../hooks/toasts.hooks';

interface CreateChangeRequestProps {}

export interface FormInput {
  type: Exclude<ChangeRequestType, 'STAGE_GATE' | 'ACTIVATION'>;
  what: string;
  why: { type: ChangeRequestReason; explain: string }[];
}

const CreateChangeRequest: React.FC<CreateChangeRequestProps> = () => {
  const auth = useAuth();
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, error, mutateAsync } = useCreateStandardChangeRequest();
  const {
    isLoading: cpsIsLoading,
    isError: cpsIsError,
    error: cpsError,
    mutateAsync: cpsMutateAsync
  } = useCreateProposeSolution();
  const [proposedSolutions, setProposedSolutions] = useState<ProposedSolution[]>([]);
  const [wbsNum, setWbsNum] = useState(query.get('wbsNum') || '');
  const toast = useToast();

  if (isLoading || cpsIsLoading || !auth.user) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (cpsIsError) return <ErrorPage message={cpsError?.message} />;

  const { userId } = auth.user;

  const handleConfirm = async (data: FormInput) => {
    try {
      const cr = await mutateAsync({
        ...data,
        wbsNum: validateWBS(wbsNum)
      });
      const crId = parseInt(cr.message);
      proposedSolutions.forEach(async (ps) => {
        const { description, timelineImpact, scopeImpact, budgetImpact } = ps;

        await cpsMutateAsync({
          crId,
          submitterId: userId,
          description,
          timelineImpact,
          scopeImpact,
          budgetImpact
        });
      });

      history.push(routes.CHANGE_REQUESTS);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleCancel = () => {
    history.push(routes.CHANGE_REQUESTS);
  };

  return (
    <CreateChangeRequestsView
      wbsNum={wbsNum}
      setWbsNum={setWbsNum}
      crDesc={''}
      onSubmit={handleConfirm}
      proposedSolutions={proposedSolutions}
      setProposedSolutions={setProposedSolutions}
      handleCancel={handleCancel}
    />
  );
};

export default CreateChangeRequest;
