/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, validateWBS, WbsElement, wbsPipe } from 'shared';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Autocomplete, FormControl, Typography } from '@mui/material';
import { useState } from 'react';
import { UseMutateAsyncFunction } from 'react-query';
import WorkPackageFormDetails from './WorkPackageFormDetails';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import ReactHookEditableList from '../../components/ReactHookEditableList';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { startDateTester, mapBulletsToPayload } from '../../utils/form';
import { projectWbsNamePipe, projectWbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { getMonday } from '../GanttPage/GanttPackage/helpers/date-helper';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';

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

interface WorkPackageFormViewProps {
  exitActiveMode: () => void;
  mutateAsync: UseMutateAsyncFunction<unknown, unknown, unknown>;
  defaultValues?: WorkPackageFormViewPayload;
  wbsElement: WbsElement;
  leadOrManagerOptions: User[];
  blockedByOptions: { id: string; label: string }[];
  crId?: string;
  createForm?: boolean;
}

export interface WorkPackageFormViewPayload {
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

const WorkPackageFormView: React.FC<WorkPackageFormViewProps> = ({
  exitActiveMode,
  mutateAsync,
  defaultValues,
  wbsElement,
  leadOrManagerOptions,
  blockedByOptions,
  crId,
  createForm
}) => {
  const toast = useToast();
  const user = useCurrentUser();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageId: defaultValues?.workPackageId ?? 0,
      startDate: defaultValues?.startDate ?? getMonday(new Date()),
      duration: defaultValues?.duration ?? 0,
      crId: crId ?? defaultValues?.crId ?? '',
      blockedBy: defaultValues?.blockedBy ?? [],
      expectedActivities: defaultValues?.expectedActivities ?? [],
      deliverables: defaultValues?.deliverables ?? [],
      stage: defaultValues?.stage ?? 'NONE'
    }
  });

  const [managerId, setManagerId] = useState<string | undefined>(wbsElement.projectManager?.userId.toString());
  const [leadId, setLeadId] = useState<string | undefined>(wbsElement.projectLead?.userId.toString());

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

  const { userId } = user;

  const transformDate = (date: Date) => {
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
    return `${date.getFullYear().toString()}-${month}-${day}`;
  };
  const onSubmit = async (data: WorkPackageFormViewPayload) => {
    const { name, startDate, duration, blockedBy, crId, stage } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities);
    const deliverables = mapBulletsToPayload(data.deliverables);
    const blockedByWbsNums = blockedBy.map((blocker) => validateWBS(blocker));
    try {
      const payload = {
        projectLeadId: leadId ? parseInt(leadId) : undefined,
        projectManagerId: managerId ? parseInt(managerId) : undefined,
        workPackageId: defaultValues?.workPackageId,
        userId,
        name,
        crId: parseInt(crId),
        startDate: transformDate(startDate),
        duration,
        blockedBy: blockedByWbsNums,
        expectedActivities: createForm ? expectedActivities.map((activity) => activity.detail) : expectedActivities,
        deliverables: createForm ? deliverables.map((deliverable) => deliverable.detail) : deliverables,
        stage
      };
      await mutateAsync(payload);
      exitActiveMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        return;
      }
    }
  };

  const crIdDisplay = crId ?? defaultValues?.crId;

  return (
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
      <Box mb={-1}>
        <PageBreadcrumbs
          currentPageTitle={`${createForm ? 'New Work Package' : wbsPipe(wbsElement.wbsNum)} - ${wbsElement.name}`}
          previousPages={[
            createForm
              ? { name: 'Change Requests', route: routes.CHANGE_REQUESTS }
              : { name: 'Projects', route: routes.PROJECTS },
            createForm && crIdDisplay
              ? {
                  name: `Change Request #${crIdDisplay}`,
                  route: `${routes.CHANGE_REQUESTS}/${crIdDisplay}`
                }
              : {
                  name: `${projectWbsNamePipe(wbsElement)}`,
                  route: `${routes.PROJECTS}/${projectWbsPipe(wbsElement.wbsNum)}`
                }
          ]}
        />
      </Box>
      <PageLayout
        stickyHeader
        title={`${createForm ? 'New Work Package' : wbsPipe(wbsElement.wbsNum)} - ${wbsElement.name}`}
        headerRight={
          <Box textAlign="right">
            <NERFailButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
              Submit
            </NERSuccessButton>
          </Box>
        }
      >
        <WorkPackageFormDetails
          control={control}
          errors={errors}
          usersForProjectLead={leadOrManagerOptions}
          usersForProjectManager={leadOrManagerOptions}
          lead={leadId}
          manager={managerId}
          setLead={setLeadId}
          setManager={setManagerId}
          createForm={createForm}
        />
        <Box my={2}>
          <Typography variant="h5">Blocked By</Typography>
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
        </Box>
        <Typography variant="h5">Expected Activities</Typography>
        <ReactHookEditableList
          name="expectedActivities"
          register={register}
          ls={expectedActivities}
          append={appendExpectedActivity}
          remove={removeExpectedActivity}
          bulletName="Expected Activity"
        />
        <Typography variant="h5">Deliverables</Typography>
        <ReactHookEditableList
          name="deliverables"
          register={register}
          ls={deliverables}
          append={appendDeliverable}
          remove={removeDeliverable}
          bulletName="Deliverable"
        />
      </PageLayout>
    </form>
  );
};

export default WorkPackageFormView;
