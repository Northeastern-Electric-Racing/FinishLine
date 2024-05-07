/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useAllLinkTypes } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { ProjectProposedChangesCreateArgs, WbsElementStatus } from 'shared';
import * as yup from 'yup';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';

const CreateProjectCRContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();

  const [projectManagerId, setProjectManagerId] = useState<string | undefined>();
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>();

  const { mutateAsync, isLoading } = useCreateStandardChangeRequest();
  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (isLoading) return <LoadingIndicator />;
  if (!allLinkTypes || allLinkTypesIsLoading) return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const defaultValues = {
    name: '',
    budget: 0,
    summary: '',
    teamIds: [],
    carNumber: 0,
    links: [],
    crId: '',
    goals: [],
    features: [],
    constraints: [],
    rules: [],
    projectLeadId,
    projectManagerId
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    carNumber: yup.number().min(0).required('A car number is required!'),
    teamId: yup.string().required('A Team Id is required'),
    budget: yup.number().optional(),
    summary: yup.string().required('Summary is required!'),
    projectLeadId: yup.number().optional(),
    projectManagerId: yup.number().optional(),
    links: yup.array().of(
      yup.object().shape({
        linkTypeName: yup.string(),
        url: yup.string().url('Invalid URL')
      })
    )
  });

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    console.log('in onSubmitChangeRequest');
    const { name, budget, summary, links, teamIds, carNumber, goals, features, constraints, type, what, why } = data;

    const rules = data.rules.map((rule) => rule.detail);

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        status: WbsElementStatus.Active,
        teamIds: teamIds.map((number) => '' + number),
        budget,
        rules,
        goals: goals.map((g) => g.detail),
        features: features.map((f) => f.detail),
        otherConstraints: constraints.map((c) => c.detail),
        links,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined,
        carNumber: carNumber
      };
      const changeRequestPayload: CreateStandardChangeRequestPayload = {
        wbsNum: {
          carNumber: carNumber,
          projectNumber: 0,
          workPackageNumber: 0
        },
        type: type,
        what,
        why,
        proposedSolutions: [],
        projectProposedChanges: projectPayload
      };
      await mutateAsync(changeRequestPayload);
      history.push(routes.CHANGE_REQUESTS_OVERVIEW);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <ProjectFormContainer
      requiredLinkTypeNames={requiredLinkTypeNames}
      exitEditMode={() => history.push(routes.PROJECTS_ALL)}
      onSubmit={() => {}}
      defaultValues={defaultValues}
      setProjectLeadId={setProjectLeadId}
      setProjectManagerId={setProjectManagerId}
      schema={schema}
      projectLeadId={projectLeadId}
      projectManagerId={projectManagerId}
      onSubmitChangeRequest={onSubmitChangeRequest}
    />
  );
};

export default CreateProjectCRContainer;
