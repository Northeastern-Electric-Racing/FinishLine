/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useAllLinkTypes, useCreateSingleProject } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { CreateSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import * as yup from 'yup';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';
import { ProjectProposedChangesCreateArgs } from 'shared';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';

const ProjectCreateContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();
  const query = useQuery();

  const [managerId, setManagerId] = useState<string | undefined>();
  const [leadId, setLeadId] = useState<string | undefined>();

  const { mutateAsync, isLoading } = useCreateSingleProject();
  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();

  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (isLoading || isCRHookLoading) return <LoadingIndicator />;
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
    crId: query.get('crId') || '',
    descriptionBullets: [],
    leadId,
    managerId
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    // TODO update upper bound here once new car model is made
    carNumber: yup.number().min(0).max(3).required('A car number is required!'),
    teamIds: yup.array().of(yup.string()).required('Teams are required'),
    budget: yup.number().optional(),
    summary: yup.string().required('Summary is required!'),
    leadId: yup.string().optional(),
    managerId: yup.string().optional(),
    links: yup
      .array()
      .optional()
      .of(
        yup.object().shape({
          linkTypeName: yup.string(),
          url: yup.string().url('Invalid URL')
        })
      )
  });

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, teamIds, carNumber, descriptionBullets, type, what, why } = data;

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        teamIds: teamIds.map((number) => '' + number),
        budget,
        descriptionBullets,
        links,
        leadId,
        managerId,
        carNumber
      };
      const changeRequestPayload: CreateStandardChangeRequestPayload = {
        wbsNum: {
          // TODO change this to use the car model when we add it to the schema
          carNumber,
          projectNumber: 0,
          workPackageNumber: 0
        },
        type,
        what,
        why,
        proposedSolutions: [],
        projectProposedChanges: projectPayload
      };
      await mutateCRAsync(changeRequestPayload);
      history.push(routes.CHANGE_REQUESTS_OVERVIEW);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links, crId, teamIds, carNumber, descriptionBullets } = data;

    try {
      const payload: CreateSingleProjectPayload = {
        crId,
        name,
        carNumber,
        summary,
        teamIds: teamIds.map((number) => '' + number),
        budget,
        descriptionBullets,
        links,
        leadId,
        managerId
      };
      await mutateAsync(payload);
      history.push(routes.PROJECTS_ALL);
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
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      setLeadId={setLeadId}
      setManagerId={setManagerId}
      schema={schema}
      leadId={leadId}
      managerId={managerId}
      onSubmitChangeRequest={onSubmitChangeRequest}
    />
  );
};

export default ProjectCreateContainer;
