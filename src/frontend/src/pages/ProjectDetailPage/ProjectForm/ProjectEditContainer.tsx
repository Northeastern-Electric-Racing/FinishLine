/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, ProjectProposedChangesCreateArgs } from 'shared';
import { useAllLinkTypes, useEditSingleProject } from '../../../hooks/projects.hooks';
import { bulletsToObject, mapBulletsToPayload, rulesToObject } from '../../../utils/form';
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
  const [projectManagerId, setProjectManagerId] = useState<string | undefined>(project.manager?.userId.toString());
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>(project.lead?.userId.toString());
  const goals = bulletsToObject(project.goals);
  const features = bulletsToObject(project.features);
  const constraints = bulletsToObject(project.otherConstraints);
  const rules = rulesToObject(project.rules);

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
    goals,
    features,
    constraints,
    rules,
    projectLeadId,
    projectManagerId
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
    summary: yup.string().required('Summary is required!'),
    projectLeadId: yup.number().optional(),
    projectManagerId: yup.number().optional()
    //links: yup.array().of(
    //  yup.object().shape({
    //    linkTypeName: yup.string().required('Link Type is required!'),
    //    url: yup.string().required('URL is required!').url('Invalid URL')
    //  })
    //)
  });

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, carNumber, goals, features, constraints, type, what, why } = data;

    const rules = data.rules.map((rule) => rule.detail);

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        teamIds: project.teams.map((team) => team.teamId),
        budget,
        rules,
        goals: goals.map((g) => g.detail),
        features: features.map((f) => f.detail),
        otherConstraints: constraints.map((c) => c.detail),
        links,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined
      };
      const changeRequestPayload: CreateStandardChangeRequestPayload = {
        wbsNum: {
          // TODO change this to use the car model when we add it to the schema
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
      await mutateCRAsync(changeRequestPayload);
      history.push(routes.CHANGE_REQUESTS_OVERVIEW);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links } = data;
    const rules = data.rules.map((rule) => rule.detail);
    const crId = data.crId;

    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    try {
      const payload: EditSingleProjectPayload = {
        name,
        budget,
        summary,
        links,
        projectId: project.id,
        crId: Number(crId),
        rules,
        goals,
        features,
        otherConstraints,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined
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
      setProjectManagerId={setProjectManagerId}
      setProjectLeadId={setProjectLeadId}
      schema={schema}
      defaultValues={defaultValues}
      projectLeadId={projectLeadId}
      projectManagerId={projectManagerId}
      onSubmitChangeRequest={onSubmitChangeRequest}
    />
  );
};

export default ProjectEditContainer;
