/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, validateWBS, WorkPackage } from 'shared';
import { projectWbsPipe, wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useAllUsers, useCurrentUser } from '../../../hooks/users.hooks';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Autocomplete, FormControl } from '@mui/material';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { useEditWorkPackage } from '../../../hooks/work-packages.hooks';
import WorkPackageEditDetails from './WorkPackageEditDetails';
import { bulletsToObject, mapBulletsToPayload, startDateTester } from '../../../utils/form';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';
import { useSingleProject } from '../../../hooks/projects.hooks';
import PageLayout from '../../../components/PageLayout';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  startDate: yup
    .date()
    .required('Start Date is required!')
    .test('start-date-valid', 'start date is not valid', startDateTester),
  duration: yup.number().required(),
  crId: yup
    .number()
    .required('CR ID is required')
    .typeError('CR ID must be a number')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1')
});

interface WorkPackageEditContainerProps {
  workPackage: WorkPackage;
  exitEditMode: () => void;
}

export interface WorkPackageEditFormPayload {
  name: string;
  workPackageId: number;
  startDate: Date;
  duration: number;
  crId: string;
  stage: string;
  blockedBy: string[];
  expectedActivities: {
    bulletId: number;
    detail: string;
  }[];
  deliverables: {
    bulletId: number;
    detail: string;
  }[];
}

const WorkPackageEditContainer: React.FC<WorkPackageEditContainerProps> = ({ workPackage, exitEditMode }) => {
  const toast = useToast();
  const user = useCurrentUser();
  const query = useQuery();
  const allUsers = useAllUsers();
  const { name, startDate, duration } = workPackage;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      workPackageId: workPackage.id,
      name,
      crId: query.get('crId') || '',
      stage: workPackage.stage || 'NONE',
      startDate,
      blockedBy: workPackage.blockedBy.map(wbsPipe),
      duration,
      expectedActivities: bulletsToObject(workPackage.expectedActivities),
      deliverables: bulletsToObject(workPackage.deliverables)
    }
  });

  const [managerId, setManagerId] = useState<string | undefined>(workPackage.projectManager?.userId.toString());
  const [leadId, setLeadId] = useState<string | undefined>(workPackage.projectLead?.userId.toString());

  // lists of stuff
  const {
    fields: expectedActivities,
    append: appendExpectedActivity,
    remove: removeExpectedActivity
  } = useFieldArray({ control, name: 'expectedActivities' });
  const {
    fields: deliverables,
    append: appendDeliverable,
    remove: removeDeliverable
  } = useFieldArray({ control, name: 'deliverables' });

  const {
    data: project,
    isLoading: projectIsLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject(validateWBS(projectWbsPipe(workPackage.wbsNum)));

  const { mutateAsync } = useEditWorkPackage(workPackage.wbsNum);

  if (allUsers.isLoading || !allUsers.data || projectIsLoading || !project) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }
  if (projectIsError) {
    return <ErrorPage message={projectError?.message} />;
  }

  const blockedByToAutocompleteOption = (workPackage: WorkPackage) => {
    return { id: wbsPipe(workPackage.wbsNum), label: `${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}` };
  };

  const blockedByOptions =
    project.workPackages.filter((wp) => wp.id !== workPackage.id).map(blockedByToAutocompleteOption) || [];

  const { userId } = user;

  const users = allUsers.data.filter((u) => !isGuest(u.role));

  const transformDate = (date: Date) => {
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
    return `${date.getFullYear().toString()}-${month}-${day}`;
  };
  const onSubmit = async (data: WorkPackageEditFormPayload) => {
    const { name, startDate, duration, blockedBy, crId, stage } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities);
    const deliverables = mapBulletsToPayload(data.deliverables);
    const blockedByWbsNums = blockedBy.map((blocker) => validateWBS(blocker));
    try {
      const payload = {
        projectLeadId: leadId ? parseInt(leadId) : undefined,
        projectManagerId: managerId ? parseInt(managerId) : undefined,
        workPackageId: workPackage.id,
        userId,
        name,
        crId: parseInt(crId),
        startDate: transformDate(startDate),
        duration,
        blockedBy: blockedByWbsNums,
        expectedActivities,
        deliverables,
        stage
      };
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        return;
      }
    }
  };
  const projectWbsString: string = projectWbsPipe(workPackage.wbsNum);

  return (
    <PageLayout
      title={`${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${projectWbsString} - ${workPackage.projectName}`, route: `${routes.PROJECTS}/${projectWbsString}` }
      ]}
      headerRight={<ChangeRequestDropdown control={control} name="crId" errors={errors} />}
    >
      <form
        id="work-package-edit-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}
        onKeyPress={(e) => {
          e.key === 'Enter' && e.preventDefault();
        }}
      >
        <WorkPackageEditDetails
          control={control}
          errors={errors}
          usersForProjectLead={users}
          usersForProjectManager={users}
          lead={leadId}
          manager={managerId}
          setLead={setLeadId}
          setManager={setManagerId}
        />
        <PageBlock title="Blocked By">
          <FormControl fullWidth>
            <Controller
              name="blockedBy"
              control={control}
              render={({ field: { onChange, value: formValue } }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterSelectedOptions
                  multiple
                  options={blockedByOptions}
                  getOptionLabel={(option) => option.label}
                  onChange={(_, value) => onChange(value.map((v) => v.id))}
                  value={formValue.map((v: string) => blockedByOptions.find((o) => o.id === v)!)}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select Blockers" error={!!errors.blockedBy} />
                  )}
                />
              )}
            />
          </FormControl>
        </PageBlock>
        <ReactHookEditableList
          name="expectedActivities"
          register={register}
          ls={expectedActivities}
          append={appendExpectedActivity}
          remove={removeExpectedActivity}
          bulletName="Expected Activity"
        />
        <ReactHookEditableList
          name="deliverables"
          register={register}
          ls={deliverables}
          append={appendDeliverable}
          remove={removeDeliverable}
          bulletName="Deliverable"
        />
        <Box textAlign="right" sx={{ my: 2 }}>
          <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
            Submit
          </NERSuccessButton>
        </Box>
      </form>
    </PageLayout>
  );
};

export default WorkPackageEditContainer;
