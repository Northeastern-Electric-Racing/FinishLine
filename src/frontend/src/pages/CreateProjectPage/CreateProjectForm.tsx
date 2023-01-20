/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleProject } from '../../hooks/projects.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateProjectFormView from './CreateProjectFormView';

export interface CreateProjectFormInputs {
  name: string;
  carNumber: number;
  crId: number;
  summary: string;
  team: string;
}

const CreateProjectForm: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const { isLoading, mutateAsync } = useCreateSingleProject();

  if (isLoading || !auth.user) return <LoadingIndicator />;

  const { userId } = auth.user;

  const handleCancel = () => history.goBack();

  const handleSubmit = async (project: CreateProjectFormInputs) => {
    const { name, carNumber, crId, summary, team } = project;

    const payload = {
      userId,
      crId,
      name,
      carNumber,
      summary,
      team
    };

    const createdWbsNum = await mutateAsync(payload);

    history.push(`${routes.PROJECTS}/${createdWbsNum}`);
  };

  return <CreateProjectFormView onCancel={handleCancel} onSubmit={handleSubmit} allowSubmit={auth.user.role !== 'GUEST'} />;
};

export default CreateProjectForm;
