/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, ProjectProposedChangesCreateArgs } from 'shared';
import { useAllLinkTypes, useEditSingleProject } from '../../../hooks/projects.hooks';
import { bulletsToObject } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { EditSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import { useQuery } from '../../../hooks/utils.hooks';
import * as yup from 'yup';
import { FormInput as ChangeRequestFormInput } from '../../CreateChangeRequestPage/CreateChangeRequest';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { routes } from '../../../utils/routes';
import { useHistory } from 'react-router-dom';

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

export type ProjectCreateChangeRequestFormInput = ProjectFormInput & ChangeRequestFormInput;

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const toast = useToast();
  const query = useQuery();
  const history = useHistory();

  const { name, budget, summary } = project;
  const [managerId, setManagerId] = useState<string | undefined>(project.manager?.userId.toString());
  const [leadId, setLeadId] = useState<string | undefined>(project.lead?.userId.toString());
  const descriptionBullets = bulletsToObject(project.descriptionBullets);

  const { mutateAsync, isLoading } = useEditSingleProject(project.wbsNum);
  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();
  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  const links = project.links.map((link) => {
    return {
      linkId: link.linkId,
      url: link.url,
      linkTypeName: link.linkType.name
    };
  });

  if (isLoading || isCRHookLoading) return <LoadingIndicator />;
  if (!allLinkTypes || allLinkTypesIsLoading) return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const projectLinkTypeNames = links.map((link) => link.linkTypeName);

  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => {
      links.push({
        linkId: '-1',
        url: '',
        linkTypeName: name
      });
    });

  const defaultValues = {
    name,
    budget,
    summary,
    // teamId and carNumber aren't used for projectEdit
    teamIds: [],
    carNumber: 0,
    links,
    crId: query.get('crId') || '',
    descriptionBullets,
    leadId,
    managerId
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
    summary: yup.string().required('Summary is required!'),
    leadId: yup.number().optional(),
    managerId: yup.number().optional(),
    links: yup.array().of(
      yup.object().shape({
        linkTypeName: yup.string().required('Link Type is required!'),
        url: yup.string().required('URL is required!').url('Invalid URL')
      })
    )
  });

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, carNumber, type, what, why } = data;

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        teamIds: project.teams.map((team) => team.teamId),
        budget,
        descriptionBullets,
        links,
        carNumber,
        leadId: leadId ? parseInt(leadId) : undefined,
        managerId: managerId ? parseInt(managerId) : undefined
      };
      const changeRequestPayload: CreateStandardChangeRequestPayload = {
        wbsNum: project.wbsNum,
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
    const { name, budget, summary, links, descriptionBullets } = data;
    const { crId } = data;

    try {
      const payload: EditSingleProjectPayload = {
        name,
        budget,
        summary,
        links,
        projectId: project.id,
        crId: Number(crId),
        descriptionBullets,
        leadId: leadId ? parseInt(leadId) : undefined,
        managerId: managerId ? parseInt(managerId) : undefined
      };
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <ProjectFormContainer
      requiredLinkTypeNames={requiredLinkTypeNames}
      exitEditMode={exitEditMode}
      project={project}
      onSubmit={onSubmit}
      setManagerId={setManagerId}
      setLeadId={setLeadId}
      schema={schema}
      defaultValues={defaultValues}
      leadId={leadId}
      managerId={managerId}
      onSubmitChangeRequest={onSubmitChangeRequest}
    />
  );
};

export default ProjectEditContainer;
