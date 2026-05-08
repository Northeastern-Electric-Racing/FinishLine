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
import { ProjectFormInput } from './ProjectForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import { useQuery } from '../../../hooks/utils.hooks';
import * as yup from 'yup';
import { FormInput, FormInput as ChangeRequestFormInput } from '../../CreateChangeRequestPage/CreateChangeRequestView';
import {
  CreateStandardChangeRequestPayload,
  useCreateLeadershipChangeRequest,
  useCreateStandardChangeRequest
} from '../../../hooks/change-requests.hooks';
import { routes } from '../../../utils/routes';
import { useHistory } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import ProjectFormContainer from './ProjectForm';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useQueryClient } from 'react-query';

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

export type ProjectCreateChangeRequestFormInput = ProjectFormInput & ChangeRequestFormInput;

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const toast = useToast();
  const query = useQuery();
  const history = useHistory();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const { name, budget, summary, workPackages } = project;
  const [managerId, setManagerId] = useState<string | undefined>(project.manager?.userId.toString());
  const [leadId, setLeadId] = useState<string | undefined>(project.lead?.userId.toString());
  const descriptionBullets = bulletsToObject(project.descriptionBullets);

  const { mutateAsync, isLoading } = useEditSingleProject(project.wbsNum);
  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();

  const { mutateAsync: mutateLeadershipCR, isLoading: isLeadershipCRLoading } = useCreateLeadershipChangeRequest();

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

  const changeRequestSchema = yup.object().shape({
    why: yup.string().required('Why Explain is required'),
    requestedReviewerId: yup.string().optional()
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

  if (isLoading || isCRHookLoading || isLeadershipCRLoading) return <LoadingIndicator />;
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
    carNumber: project.wbsNum.carNumber,
    links,
    crId: query.get('crId') || '',
    descriptionBullets,
    leadId,
    managerId,
    workPackages: workPackages.map((wp) => {
      return {
        workPackageId: wp.id,
        name: wp.name,
        startDate: wp.startDate,
        duration: wp.duration,
        blockedBy: wp.blockedBy.map((id) => id.toString()),
        descriptionBullets: bulletsToObject(wp.descriptionBullets),
        stage: wp.stage ?? 'NONE'
      };
    })
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

  // Check if only lead/manager changed
  const checkOnlyLeadershipChanged = (
    formName: string,
    formBudget: number,
    formSummary: string,
    formLinks: any[],
    formDescriptionBullets: any[]
  ) => {
    return (
      formName === project.name &&
      formBudget === project.budget &&
      formSummary === project.summary &&
      JSON.stringify(formLinks.map((l) => `${l.linkTypeName}:${l.url}`).sort()) ===
        JSON.stringify(project.links.map((l) => `${l.linkType.name}:${l.url}`).sort()) &&
      JSON.stringify(formDescriptionBullets) === JSON.stringify(bulletsToObject(project.descriptionBullets)) &&
      (leadId !== project.lead?.userId.toString() || managerId !== project.manager?.userId.toString())
    );
  };

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, why, descriptionBullets } = data;

    try {
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
        requestedReviewerId: data.requestedReviewerId,
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
    const { name, budget, summary, links, descriptionBullets, crId } = data;

    try {
      const onlyLeadershipChanged = checkOnlyLeadershipChanged(name, budget, summary, links, descriptionBullets);

      if (onlyLeadershipChanged) {
        const autoCRPayload = {
          submitterId: user.userId,
          wbsNum: project.wbsNum,
          leadId,
          managerId
        };
        await mutateLeadershipCR(autoCRPayload);
        toast.success('Changes submitted successfully');
        // fixes cache issue
        await queryClient.refetchQueries(['projects']);
        exitEditMode();
        return;
      }

      if (!crId) throw new Error('Change request id is required for editing project');

      const payload: EditSingleProjectPayload = {
        name,
        budget,
        summary,
        links,
        projectId: project.id,
        crId,
        descriptionBullets,
        leadId,
        managerId
      };
      await mutateAsync(payload);
      toast.success('Project updated successfully');
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  // calculate for submit button status
  const onlyLeadershipChanged = checkOnlyLeadershipChanged(
    defaultValues.name,
    defaultValues.budget,
    defaultValues.summary,
    defaultValues.links,
    defaultValues.descriptionBullets
  );

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
      changeRequestFormReturn={changeRequestFormMethods}
      leadId={leadId}
      managerId={managerId}
      onSubmitChangeRequest={onSubmitChangeRequest}
      onlyLeadershipChanged={onlyLeadershipChanged}
    />
  );
};

export default ProjectEditContainer;
