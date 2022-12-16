/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleProject } from '../../hooks/projects.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateProjectFormView from './CreateProjectFormView';

export interface CreateProjectFormStates {
  name: Dispatch<SetStateAction<string>>;
  carNumber: Dispatch<SetStateAction<number>>;
  crId: Dispatch<SetStateAction<number>>;
  summary: Dispatch<SetStateAction<string>>;
}

const CreateProjectForm: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const [name, setName] = useState('');
  const [carNumber, setCarNumber] = useState(-1);
  const [crId, setCrId] = useState(-1);
  const [summary, setSummary] = useState('');
  const { isLoading, mutateAsync } = useCreateSingleProject();

  if (isLoading || !auth.user) return <LoadingIndicator />;

  const { userId } = auth.user;

  const states = {
    name: setName,
    carNumber: setCarNumber,
    crId: setCrId,
    summary: setSummary
  };

  const handleCancel = () => history.goBack();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      userId,
      crId,
      name,
      carNumber,
      summary
    };

    const createdWbsNum = await mutateAsync(payload);

    history.push(`${routes.PROJECTS}/${createdWbsNum}`);
  };

  return (
    <CreateProjectFormView
      states={states}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      allowSubmit={auth.user.role !== 'GUEST'}
    />
  );
};

export default CreateProjectForm;
