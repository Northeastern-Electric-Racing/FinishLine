/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Project, ProjectProposedChangesCreateArgs, projectEditNeedsCR } from 'shared';
import { useAllLinkTypes, useEditSingleProject } from '../../../hooks/projects.hooks';
import { bulletsToObject } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';
import { ProjectFormInput } from './ProjectForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import * as yup from 'yup';
import {
  CreateStandardChangeRequestPayload,
  useCreateLeadershipChangeRequest,
  useCreateStandardChangeRequest
} from '../../../hooks/change-requests.hooks';
import { routes } from '../../../utils/routes';
import { useHistory } from 'react-router-dom';
import ProjectFormContainer from './ProjectForm';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useQueryClient } from 'react-query';

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const toast = useToast();
  const history = useHistory();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const { name, budget, summary, workPackages } = project;
  const [managerId, setManagerId] = useState<string | undefined>(project.manager?.userId.toString());
  const [leadId, setLeadId] = useState<string | undefined>(project.lead?.userId.toString());
  const descriptionBullets = bulletsToObject(project.descriptionBullets);

  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();
  const { mutateAsync: mutateLeadershipCR, isLoading: isLeadershipCRLoading } = useCreateLeadershipChangeRequest();
  const { mutateAsync: editProject, isLoading: isEditProjectLoading } = useEditSingleProject(project.wbsNum);

  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  const links = project.links.map((link) => ({
    linkId: link.linkId,
    url: link.url,
    linkTypeName: link.linkType.name
  }));

  if (isCRHookLoading || isLeadershipCRLoading || isEditProjectLoading) return <LoadingIndicator />;
  if (!allLinkTypes || allLinkTypesIsLoading) return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);
  const projectLinkTypeNames = links.map((link) => link.linkTypeName);
  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => links.push({ linkId: '-1', url: '', linkTypeName: name }));

  const defaultValues: ProjectFormInput = {
    name,
    budget,
    summary,
    teamIds: [],
    carNumber: project.wbsNum.carNumber,
    links,
    descriptionBullets,
    workPackages: workPackages.map((wp) => ({
      workPackageId: wp.id,
      name: wp.name,
      startDate: wp.startDate,
      duration: wp.duration,
      blockedBy: wp.blockedBy.map((id) => id.toString()),
      descriptionBullets: bulletsToObject(wp.descriptionBullets),
      stage: wp.stage ?? 'NONE'
    }))
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
    summary: yup.string().required('Summary is required!'),
    leadId: yup.string().optional(),
    managerId: yup.string().optional(),
    links: yup.array().of(
      yup.object().shape({
        linkTypeName: yup.string().required('Link Type is required!'),
        url: yup.string().required('URL is required!').url('Invalid URL')
      })
    )
  });

  const onSubmit = async (data: ProjectFormInput, why?: string, requestedReviewerId?: string) => {
    const { name, budget, summary, links, descriptionBullets } = data;

    try {
      const leadershipChanged =
        leadId !== project.lead?.userId.toString() || managerId !== project.manager?.userId.toString();

      // budget and description bullets need a change request
      const meaningfulFieldsChanged = projectEditNeedsCR(
        project.budget,
        budget,
        bulletsToObject(project.descriptionBullets),
        descriptionBullets
      );

      // name, summary and links can be saved directly
      const nonMeaningfulFieldsChanged =
        name !== project.name ||
        summary !== project.summary ||
        JSON.stringify(links.map((l) => `${l.linkTypeName}:${l.url}`).sort()) !==
          JSON.stringify(project.links.map((l) => `${l.linkType.name}:${l.url}`).sort());

      if (leadershipChanged) {
        await mutateLeadershipCR({
          submitterId: user.userId,
          wbsNum: project.wbsNum,
          leadId,
          managerId
        });
      }

      if (meaningfulFieldsChanged) {
        if (!why) throw new Error('Why is required for standard change request');
        const projectPayload: ProjectProposedChangesCreateArgs = {
          name,
          summary,
          teamIds: project.teams.map((team) => team.teamId),
          budget,
          descriptionBullets,
          links,
          leadId,
          managerId,
          workPackageProposedChanges: []
        };
        const changeRequestPayload: CreateStandardChangeRequestPayload = {
          wbsNum: project.wbsNum,
          why,
          requestedReviewerId,
          projectProposedChanges: projectPayload
        };
        await mutateCRAsync(changeRequestPayload);
        toast.success('Change request submitted successfully');
        await queryClient.refetchQueries(['projects']);
        history.push(routes.CHANGE_REQUESTS_OVERVIEW);
        return;
      }

      if (nonMeaningfulFieldsChanged) {
        await editProject({
          projectId: project.id,
          name,
          budget,
          summary,
          descriptionBullets,
          links,
          leadId,
          managerId
        });
        toast.success('Project updated successfully');
        await queryClient.refetchQueries(['projects']);
        exitEditMode();
        return;
      }

      // only leadership changed
      toast.success('Changes submitted successfully');
      await queryClient.refetchQueries(['projects']);
      history.push(routes.CHANGE_REQUESTS_OVERVIEW);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
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
      defaultValues={defaultValues}
      schema={schema}
      leadId={leadId}
      managerId={managerId}
    />
  );
};

export default ProjectEditContainer;
