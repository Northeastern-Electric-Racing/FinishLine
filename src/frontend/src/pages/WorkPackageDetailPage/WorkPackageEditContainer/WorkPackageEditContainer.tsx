/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, validateWBS, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Box, TextField, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { useEditWorkPackage } from '../../../hooks/work-packages.hooks';
import WorkPackageEditDetails from './WorkPackageEditDetails';
import { bulletsToObject, mapBulletsToPayload, startDateTester } from '../../../utils/form';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  startDate: yup
    .date()
    .required('Start Date is required!')
    .test('start-date-valid', 'start date is not valid', startDateTester),
  duration: yup.number().required()
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
  blockedBy: {
    wbsNum: string;
  }[];
  stage: string;
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
  const auth = useAuth();
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
      duration,
      blockedBy: workPackage.blockedBy.map((dep) => {
        const wbsNum = wbsPipe(dep);
        return { wbsNum };
      }),
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
  const { fields: blockedBy, append: appendBlocker, remove: removeBlocker } = useFieldArray({ control, name: 'blockedBy' });

  const { mutateAsync } = useEditWorkPackage(workPackage.wbsNum);

  if (allUsers.isLoading || !allUsers.data || !auth.user) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }
  const { userId } = auth.user;

  const users = allUsers.data.filter((u) => !isGuest(u.role));

  const transformDate = (date: Date) => {
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
    return `${date.getFullYear().toString()}-${month}-${day}`;
  };
  const onSubmit = async (data: WorkPackageEditFormPayload) => {
    const { name, startDate, duration, crId, blockedBy, stage } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities);
    const deliverables = mapBulletsToPayload(data.deliverables);

    try {
      const payload = {
        projectLead: leadId ? parseInt(leadId) : undefined,
        projectManager: managerId ? parseInt(managerId) : undefined,
        workPackageId: workPackage.id,
        userId,
        name,
        crId: parseInt(crId),
        startDate: transformDate(startDate),
        duration,
        blockedBy: blockedBy.map((dep) => {
          return validateWBS(dep.wbsNum);
        }),
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

  const projectWbsString: string = wbsPipe({ ...workPackage.wbsNum, workPackageNumber: 0 });

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
      <PageTitle
        title={`${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`}
        previousPages={[
          { name: 'Projects', route: routes.PROJECTS },
          { name: `${projectWbsString} - ${workPackage.projectName}`, route: `${routes.PROJECTS}/${projectWbsString}` }
        ]}
        actionButton={
          <ReactHookTextField name="crId" control={control} label="Change Request Id" type="number" size="small" />
        }
      />
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
        {blockedBy.map((_element, i) => {
          return (
            <Grid item sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField required autoComplete="off" {...register(`blockedBy.${i}.wbsNum`)} sx={{ width: 1 / 10 }} />
              <IconButton type="button" onClick={() => removeBlocker(i)} sx={{ mx: 1, my: 0 }}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          );
        })}
        <Button variant="contained" color="success" onClick={() => appendBlocker({ wbsNum: '' })} sx={{ mt: 2 }}>
          + ADD NEW BLOCKER
        </Button>
      </PageBlock>

      <PageBlock title="Expected Activities">
        <ReactHookEditableList
          name="expectedActivities"
          register={register}
          ls={expectedActivities}
          append={appendExpectedActivity}
          remove={removeExpectedActivity}
        />
      </PageBlock>
      <PageBlock title="Deliverables">
        <ReactHookEditableList
          name="deliverables"
          register={register}
          ls={deliverables}
          append={appendDeliverable}
          remove={removeDeliverable}
        />
      </PageBlock>
      <Box textAlign="right" sx={{ my: 2 }}>
        <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
          Submit
        </NERSuccessButton>
      </Box>
    </form>
  );
};

export default WorkPackageEditContainer;
