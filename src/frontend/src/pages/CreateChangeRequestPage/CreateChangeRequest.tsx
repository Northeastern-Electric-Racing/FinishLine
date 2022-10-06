/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestExplanation, ChangeRequestType, ProposedSolution, validateWBS } from 'shared';
import { useAuth } from '../../hooks/Auth.hooks';
import {
  useCreateProposeSolution,
  useCreateStandardChangeRequest
} from '../../hooks/ChangeRequests.hooks';
import { useQuery } from '../../hooks/Utils.hooks';
import { routes } from '../../utils/Routes';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateChangeRequestsView from './CreateChangeRequestView';
import { useState } from 'react';

interface CreateChangeRequestProps {}

export interface FormInput {
  wbsNum: string;
  type: Exclude<ChangeRequestType, 'STAGE_GATE' | 'ACTIVATION'>;
  what: string;
  scopeImpact: string;
  timelineImpact: number;
  budgetImpact: number;
  why: ChangeRequestExplanation[];
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

  const handleConfirm = async (data: FormInput) => {
    if (auth.user?.userId === undefined) {
      throw new Error('Cannot review change request without being logged in');
    }
    const crId = await mutateAsync({
      ...data,
      wbsNum: validateWBS(data.wbsNum),
      submitterId: auth.user?.userId
    });

    proposedSolutions.forEach(async (ps) => {
      const { description, timelineImpact, scopeImpact, budgetImpact } = ps;
      await cpsMutateAsync({
        crId,
        submitterId: auth.user!.userId,
        description,
        timelineImpact,
        scopeImpact,
        budgetImpact
      });
    });

    history.push(routes.CHANGE_REQUESTS);
  };

  if (isLoading || cpsIsLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (cpsIsError) return <ErrorPage message={cpsError?.message} />;

  return (
    <CreateChangeRequestsView
      wbsNum={query.get('wbsNum') || ''}
      crDesc={query.get('riskDetails') || ''}
      onSubmit={handleConfirm}
      proposedSolutions={proposedSolutions}
      setProposedSolutions={setProposedSolutions}
    />
  );
};

export default CreateChangeRequest;
