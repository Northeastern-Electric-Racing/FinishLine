/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useAllLinkTypes } from '../../../hooks/projects.hooks';
import { mapBulletsToStrings } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { ChangeRequestReason, ChangeRequestType, ProjectProposedChangesCreateArgs, WbsElementStatus } from 'shared';
import * as yup from 'yup';

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
    name: String(),
    budget: 0,
    summary: String(),
    teamId: String(),
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
    links: yup
      .array()
      .optional()
      .of(
        yup
          .object()
          .optional()
          .shape({
            linkTypeName: yup.string().optional(),
            url: yup.string().optional().url('Invalid URL')
          })
      )
  });

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links, teamId, carNumber } = data;

    const rules = data.rules.map((rule) => rule.detail);
    const goals = mapBulletsToStrings(data.goals);
    const features = mapBulletsToStrings(data.features);
    const otherConstraints = mapBulletsToStrings(data.constraints);

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        status: WbsElementStatus.Active,
        teamIds: [teamId],
        budget,
        rules,
        newProject: true,
        goals,
        features,
        otherConstraints,
        links,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined,
        carNumber: carNumber
      };
      const payload: CreateStandardChangeRequestPayload = {
        wbsNum: {
          carNumber: carNumber,
          projectNumber: 0,
          workPackageNumber: 0
        },
        type: ChangeRequestType.Issue,
        what: name,
        why: [{ explain: 'explanation', type: ChangeRequestReason.Competition }],
        proposedSolutions: [],
        projectProposedChanges: projectPayload
      };
      await mutateAsync(payload);
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
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      setProjectLeadId={setProjectLeadId}
      setProjectManagerId={setProjectManagerId}
      schema={schema}
      projectLeadId={projectLeadId}
      projectManagerId={projectManagerId}
      autoCRMode={true}
    />
  );
};

export default CreateProjectCRContainer;
