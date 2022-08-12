/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestExplanation, ChangeRequestType, validateWBS } from 'shared';
import { useAuth } from '../../hooks/Auth.hooks';
import { useCreateStandardChangeRequest } from '../../hooks/ChangeRequests.hooks';
import { useQuery } from '../../hooks/Utils.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateChangeRequestsView from './CreateChangeRequestView';

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

  const handleConfirm = async (data: FormInput) => {
    if (auth.user?.userId === undefined) {
      throw new Error('Cannot review change request without being logged in');
    }
    await mutateAsync({
      ...data,
      wbsNum: validateWBS(data.wbsNum),
      submitterId: auth.user?.userId
    });
    history.push(routes.CHANGE_REQUESTS);
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return <CreateChangeRequestsView wbsNum={query.get('wbsNum') || ''} onSubmit={handleConfirm} />;
};

export default CreateChangeRequest;
