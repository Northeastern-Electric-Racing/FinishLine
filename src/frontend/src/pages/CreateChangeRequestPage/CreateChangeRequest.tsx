/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { wbsTester } from '../../utils/form';
import { useHistory } from 'react-router-dom';
import { ChangeRequestReason, ChangeRequestType, ProposedSolutionFormInput, validateWBS } from 'shared';
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
import { StandardChangeRequestType } from './CreateChangeRequestView';
import { yupResolver } from '@hookform/resolvers/yup';

interface CreateChangeRequestProps {}

const CreateChangeRequest: React.FC<CreateChangeRequestProps> = () => {
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, error, mutateAsync } = useCreateStandardChangeRequest();
  const defaultProposedSolution = query.get('budgetChange')
    ? [
        {
          id: '',
          description: 'Increase Budget',
          budgetImpact: Number(query.get('budgetChange')),
          timelineImpact: 0,
          scopeImpact: 'No Changes'
        }
      ]
    : query.get('timelineDelay')
      ? [
          {
            id: '',
            description: 'Timeline Delay',
            budgetImpact: 0,
            timelineImpact: Number(query.get('timelineDelay')),
            scopeImpact: 'No Changes'
          }
        ]
      : [];
  const [proposedSolutions, setProposedSolutions] = useState<ProposedSolutionFormInput[]>(defaultProposedSolution);
  const [wbsNum, setWbsNum] = useState(query.get('wbsNum') || '');
  const toast = useToast();
  const changeRequestSchema = yup.object().shape({
    type: yup.mixed<StandardChangeRequestType>().required('Type is required'),
    what: yup.string().required('What is required'),
    why: yup
      .array()
      .min(1, 'At least one Why is required')
      .required('Why is required')
      .of(
        yup.object().shape({
          type: yup.mixed<ChangeRequestReason>().required('Why Type is required'),
          explain: yup
            .string()
            .required('Why Explain is required')
            .when('type', ([type], schema) =>
              type === ChangeRequestReason.OtherProject
                ? schema.required().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
                : yup.string()
            )
        })
      )
  });

  const { reset: resetChangeRequestForm, ...changeRequestFormMethods } = useForm<FormInput>({
    resolver: yupResolver(changeRequestSchema),
    defaultValues: query.get('budgetChange')
      ? {
          what: 'Increase the budget to account for the cost of materials',
          why: [{ type: ChangeRequestReason.Other, explain: 'The cost of materials ended up exceeding the initial budget' }],
          type: ChangeRequestType.Issue
        }
      : query.get('timelineDelay')
        ? {
            what: 'Timeline delay',
            why: [{ type: ChangeRequestReason.Other, explain: 'Decided to extend timeline after design review' }],
            type: ChangeRequestType.Redefinition
          }
        : query.get('createWP')
          ? {
              what: '',
              why: [{ type: ChangeRequestReason.Initialization, explain: 'Creating a Work Package on this Project' }],
              type: ChangeRequestType.Redefinition
            }
          : {
              what: '',
              why: [{ type: ChangeRequestReason.Other, explain: '' }],
              type: ChangeRequestType.Issue
            }
  });

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const handleConfirm = async (data: FormInput) => {
    const requestHasASolution: boolean = proposedSolutions.length !== 0;
    try {
      if (!requestHasASolution) throw new Error('You must have at least one proposed solution added!');
      await mutateAsync({
        ...data,
        wbsNum: validateWBS(wbsNum),
        proposedSolutions
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      if (requestHasASolution) history.push(`${routes.PROJECTS}/${wbsNum}/change-requests`);
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
      proposedSolutions={proposedSolutions}
      setProposedSolutions={setProposedSolutions}
      handleCancel={handleCancel}
      changeRequestFormReturn={changeRequestFormMethods}
    />
  );
};

export default CreateChangeRequest;
