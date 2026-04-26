/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useHistory } from 'react-router-dom';
import { validateWBS } from 'shared';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateChangeRequestsView from './CreateChangeRequestView';
import { useState } from 'react';
import { useToast } from '../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';
import { FormInput } from './CreateChangeRequestView';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface CreateChangeRequestProps {}

const CreateChangeRequest: React.FC<CreateChangeRequestProps> = () => {
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, error, mutateAsync } = useCreateStandardChangeRequest();
  const [wbsNum, setWbsNum] = useState(query.get('wbsNum') || '');
  const toast = useToast();
  const changeRequestSchema = yup.object().shape({
    why: yup.string().required('Why Explain is required')
  });

  const { reset: resetChangeRequestForm, ...changeRequestFormMethods } = useForm<FormInput>({
    resolver: yupResolver(changeRequestSchema),
    defaultValues: query.get('budgetChange')
      ? {
          why: 'The cost of materials ended up exceeding the initial budget'
        }
      : query.get('timelineDelay')
        ? {
            why: 'Decided to extend timeline after design review'
          }
        : query.get('createWP')
          ? {
              why: 'Creating a Work Package on this Project'
            }
          : {
              why: ''
            }
  });

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const handleConfirm = async (data: FormInput) => {
    try {
      await mutateAsync({
        ...data,
        wbsNum: validateWBS(wbsNum)
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      history.push(`${routes.PROJECTS}/${wbsNum}/change-requests`);
    }
  };

  const handleCancel = () => {
    history.push(routes.CHANGE_REQUESTS);
  };

  return (
    <CreateChangeRequestsView
      wbsNum={wbsNum}
      setWbsNum={setWbsNum}
      onSubmit={handleConfirm}
      handleCancel={handleCancel}
      changeRequestFormReturn={changeRequestFormMethods}
    />
  );
};

export default CreateChangeRequest;
