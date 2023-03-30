/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { validateWBS, WorkPackage } from 'shared';
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
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useToast } from '../../../hooks/toasts.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  startDate: yup.date().required('Start Date is required!'),
  duration: yup.number().required()
});

interface WorkPackageEditContainerProps {
  workPackage: WorkPackage;
  exitEditMode: () => void;
}

export interface dataPayload {
  name: string;
  projectLead: number | undefined;
  projectManager: number | undefined;
  workPackageId: number;
  startDate: Date;
  duration: number;
  crId: string;
  dependencies: {
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
      projectLead: workPackage.projectLead?.userId,
      projectManager: workPackage.projectManager?.userId,
      workPackageId: workPackage.id,
      name,
      crId: query.get('crId') || '',
      stage: workPackage.stage || 'NONE',
      startDate,
      duration,
      dependencies: workPackage.dependencies.map((dep) => {
        const wbsNum = wbsPipe(dep);
        return { wbsNum };
      }),
      expectedActivities: bulletsToObject(workPackage.expectedActivities),
      deliverables: bulletsToObject(workPackage.deliverables)
    }
  });
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
    fields: dependencies,
    append: appendDependency,
    remove: removeDependency
  } = useFieldArray({ control, name: 'dependencies' });

  const { mutateAsync } = useEditWorkPackage(workPackage.wbsNum);

  if (allUsers.isLoading || !allUsers.data || !auth.user) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }
  const { userId } = auth.user;

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

  const transformDate = (date: Date) => {
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
    return `${date.getFullYear().toString()}-${month}-${day}`;
  };

  const onSubmit = async (data: dataPayload) => {
    const { name, projectLead, projectManager, startDate, duration, crId, dependencies, stage } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities);
    const deliverables = mapBulletsToPayload(data.deliverables);

    try {
      const payload = {
        projectLead,
        projectManager,
        workPackageId: workPackage.id,
        userId,
        name,
        crId: parseInt(crId),
        startDate: transformDate(startDate),
        duration,
        dependencies: dependencies.map((dep) => {
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
          { name: projectWbsString, route: `${routes.PROJECTS}/${projectWbsString}` }
        ]}
        actionButton={
          <ReactHookTextField name="crId" control={control} label="Change Request Id" type="number" size="small" />
        }
      />
      <WorkPackageEditDetails control={control} errors={errors} users={users} />
      <PageBlock title="Dependencies">
        {dependencies.map((_element, i) => {
          return (
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField required autoComplete="off" {...register(`dependencies.${i}.wbsNum`)} sx={{ width: 1 / 10 }} />
              <IconButton type="button" onClick={() => removeDependency(i)} sx={{ mx: 1, my: 0 }}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          );
        })}
        <Button variant="contained" color="success" onClick={() => appendDependency({ wbsNum: '' })} sx={{ mt: 2 }}>
          + ADD NEW DEPENDENCY
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
