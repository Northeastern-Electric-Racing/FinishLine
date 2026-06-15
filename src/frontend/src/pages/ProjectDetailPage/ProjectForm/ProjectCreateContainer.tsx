/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { wbsTester } from '../../../utils/form';
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
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FormInput } from '../../CreateChangeRequestPage/CreateChangeRequestView';
import { StandardChangeRequestType } from '../../CreateChangeRequestPage/CreateChangeRequestView';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';
import { dateToMidnightUTC, ProjectProposedChangesCreateArgs, WbsNumber, WorkPackageStage } from 'shared';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { useCreateSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import { useGlobalCarFilter } from '../../../app/AppGlobalCarFilterContext';
import { ChangeRequestReason } from 'shared';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestType } from 'shared';

const ProjectCreateContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();
  const query = useQuery();

  const [managerId, setManagerId] = useState<string | undefined>();
  const [leadId, setLeadId] = useState<string | undefined>();
  const { selectedCar, isLoading: carFilterIsLoading } = useGlobalCarFilter();

  const { mutateAsync: createProjectMutateAsync, isLoading: createProjectIsLoading } = useCreateSingleProject();
  const { mutateAsync: mutateCRAsync, isLoading: isCRHookLoading } = useCreateStandardChangeRequest();
  const { mutateAsync: createWpMutateAsync, isLoading: createWpIsLoading } = useCreateSingleWorkPackage();

  const defaultValues = {
    name: '',
    budget: 0,
    summary: '',
    teamIds: [],
    carNumber: selectedCar === 'all-cars' ? undefined : selectedCar.wbsNum.carNumber,
    links: [],
    crId: query.get('crId') || undefined,
    descriptionBullets: [],
    leadId,
    managerId,
    workPackages: []
  };

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    carNumber: yup.number().min(0).required('A car selection is required'),
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

  const changeRequestSchema = yup.object().shape({
    type: yup.mixed<StandardChangeRequestType>().required('Type is required'),
    what: yup.string().required('What is required'),
    why: yup
      .array()
      .min(1, 'At least one Why is required')
      .required('Why is required')
      .of(
        yup.object().shape({
          type: yup.mixed<ChangeRequestReason>().required('Why Type is required'),
          explain: yup
            .string()
            .required('Why Explain is required')
            .when('type', ([type], schema) =>
              type === ChangeRequestReason.OtherProject
                ? schema.required().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
                : yup.string()
            )
        })
      )
  });

  const { reset: resetChangeRequestForm, ...changeRequestFormMethods } = useForm<FormInput>({
    resolver: yupResolver(changeRequestSchema),
    defaultValues: query.get('budgetChange')
      ? {
          what: 'Increase the budget to account for the cost of materials',
          why: [{ type: ChangeRequestReason.Other, explain: 'The cost of materials ended up exceeding the initial budget' }],
          type: ChangeRequestType.Issue
        }
      : query.get('timelineDelay')
        ? {
            what: 'Timeline delay',
            why: [{ type: ChangeRequestReason.Other, explain: 'Decided to extend timeline after design review' }],
            type: ChangeRequestType.Redefinition
          }
        : query.get('createWP')
          ? {
              what: '',
              why: [{ type: ChangeRequestReason.Initialization, explain: 'Creating a Work Package on this Project' }],
              type: ChangeRequestType.Redefinition
            }
          : {
              what: '',
              why: [{ type: ChangeRequestReason.Other, explain: '' }],
              type: ChangeRequestType.Issue
            }
  });

  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (
    createProjectIsLoading ||
    isCRHookLoading ||
    createWpIsLoading ||
    !allLinkTypes ||
    allLinkTypesIsLoading ||
    carFilterIsLoading
  )
    return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const onSubmitChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, teamIds, carNumber, descriptionBullets, type, what, why } = data;

    // Car number could be zero and a truthy check would fail
    if (carNumber === undefined) throw new Error('Car number is required!');

    try {
      const projectPayload: ProjectProposedChangesCreateArgs = {
        name,
        summary,
        teamIds: teamIds.map((id: string) => '' + id),
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
          startDate: dateToMidnightUTC(wp.startDate).toISOString(),
          duration: Number(wp.duration),
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
      changeRequestFormReturn={changeRequestFormMethods}
    />
  );
};

export default ProjectCreateContainer;
