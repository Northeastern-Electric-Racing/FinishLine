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
import { ProjectProposedChangesCreateArgs, WbsNumber, WorkPackageStage } from 'shared';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { useCreateSingleWorkPackage } from '../../../hooks/work-packages.hooks';

const ProjectCreateContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();
  const query = useQuery();

  const [managerId, setManagerId] = useState<string | undefined>();
  const [leadId, setLeadId] = useState<string | undefined>();

  const { mutateAsync: createProjectMutateAsync, isLoading: createProjectIsLoading } = useCreateSingleProject();
  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();
  const { mutateAsync: createWpMutateAsync, isLoading: createWpIsLoading } = useCreateSingleWorkPackage();

  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (createProjectIsLoading || isCRHookLoading || createWpIsLoading || !allLinkTypes || allLinkTypesIsLoading)
    return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const defaultValues = {
    name: '',
    budget: 0,
    summary: '',
    teamIds: [],
    carNumber: 0,
    links: [],
    crId: query.get('crId') || undefined,
    descriptionBullets: [],
    leadId,
    managerId,
    workPackages: []
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    // TODO update upper bound here once new car model is made
    carNumber: yup.number().min(0).required('A car number is required!'),
    teamIds: yup.array().of(yup.string()).required('Teams are required'),
    budget: yup.number().optional(),
    summary: yup.string().required('Summary is required!'),
    leadId: yup.string().optional(),
    managerId: yup.string().optional(),
    links: yup
      .array()
      .optional()
      .of(yup.object().shape({ linkTypeName: yup.string(), url: yup.string().url('Invalid URL') })),
    workPackages: yup.array()
  });

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, teamIds, carNumber, descriptionBullets, type, what, why } = data;

    // Car number could be zero and a truthy check would fail
    if (carNumber === undefined) throw new Error('Car number is required!');

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
        carNumber,
        workPackageProposedChanges: []
      };
      const changeRequestPayload: CreateStandardChangeRequestPayload = {
        wbsNum: { carNumber, projectNumber: 0, workPackageNumber: 0 },
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
    const { name, budget, summary, links, crId, teamIds, carNumber, descriptionBullets, workPackages } = data;

    // Car number could be zero and a truthy check would fail
    if (carNumber === undefined) throw new Error('Car number is required!');

    try {
      const payload: CreateSingleProjectPayload = {
        crId: crId || undefined,
        name,
        carNumber,
        summary,
        teamIds,
        budget,
        descriptionBullets,
        links,
        leadId,
        managerId
      };
      const project = await createProjectMutateAsync(payload);

      // Topologically sort the work packages by blocking relationships
      const sortedWorkPackages = (() => {
        const workPackageMap = new Map<string, (typeof workPackages)[0]>();
        const inDegree = new Map<string, number>();
        const result: typeof workPackages = [];

        // Initialize the maps
        workPackages.forEach((wp) => {
          workPackageMap.set(wp.workPackageId, wp);
          inDegree.set(wp.workPackageId, 0);
        });

        // Calculate in-degrees
        workPackages.forEach((wp) => {
          wp.blockedBy.forEach((blockerId) => {
            inDegree.set(blockerId, (inDegree.get(blockerId) || 0) + 1);
          });
        });

        // Collect work packages with no blockers
        const queue = workPackages.filter((wp) => inDegree.get(wp.workPackageId) === 0);

        // Process the queue
        while (queue.length > 0) {
          const wp = queue.shift()!;
          result.push(wp);

          wp.blockedBy.forEach((blockerId) => {
            const degree = inDegree.get(blockerId)! - 1;
            inDegree.set(blockerId, degree);
            if (degree === 0) {
              queue.push(workPackageMap.get(blockerId)!);
            }
          });
        }

        // Check for cycles
        if (result.length !== workPackages.length) {
          throw new Error('Cycle detected in work packages');
        }

        return result;
      })().reverse();

      const idToWbs = new Map<string, WbsNumber>();

      for (const wp of sortedWorkPackages) {
        const created = await createWpMutateAsync({
          name: wp.name,
          startDate: wp.startDate.toISOString(),
          duration: wp.duration,
          blockedBy: wp.blockedBy.map((blocker) => idToWbs.get(blocker)!),
          projectWbsNum: project.wbsNum,
          stage: wp.stage as WorkPackageStage | 'NONE',
          descriptionBullets: wp.descriptionBullets
        });

        idToWbs.set(wp.workPackageId, created.wbsNum);
      }

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
