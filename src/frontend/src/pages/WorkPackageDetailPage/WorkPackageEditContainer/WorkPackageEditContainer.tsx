/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, validateWBS, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
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
import ReactHookTextField from '../../../components/ReactHookTextField';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { useEditWorkPackage } from '../../../hooks/work-packages.hooks';
import WorkPackageEditDetails from './WorkPackageEditDetails';
import DeleteIcon from '@mui/icons-material/Delete';

/*
 * maps a description bullet list to the object needed for forms
 * can't use `id` instead of `bulletId` because react-hook-forms uses id built in for arrays of objects
 */
const bulletsToObject = (bullets: DescriptionBullet[]) =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { bulletId: bullet.id, detail: bullet.detail };
    });

// transforms the bullets made by react-hook-forms to the objects needed for the payload to the backend
const mapBulletsToPayload = (ls: { bulletId: number; detail: string }[]) => {
  return ls.map((ele) => {
    return { id: ele.bulletId, detail: ele.detail };
  });
};

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  startDate: yup.date().required('Start Date is required!'),
  duration: yup.number().required()
});

interface WorkPackageEditContainerProps {
  workPackage: WorkPackage;
  exitEditMode: () => void;
}

const WorkPackageEditContainer: React.FC<WorkPackageEditContainerProps> = ({ workPackage, exitEditMode }) => {
  const auth = useAuth();
  const query = useQuery();
  const allUsers = useAllUsers();
  const { name, startDate, duration, status } = workPackage;
  const { userId } = auth.user!;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      projectLeadId: workPackage.projectLead?.userId,
      projectManagerId: workPackage.projectManager?.userId,
      workPackageId: workPackage.id,
      userId,
      name,
      crId: query.get('crId') || '',
      startDate,
      duration,
      dependencies: workPackage.dependencies.map((dep) => {
        const wbsNum = dep.carNumber + '.' + dep.projectNumber + '.' + dep.workPackageNumber;
        return { wbsNum };
      }),
      expectedActivities: bulletsToObject(workPackage.expectedActivities),
      deliverables: bulletsToObject(workPackage.deliverables),
      wbsElementStatus: status
    }
  });
  //lists of stuff
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

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

  const transformDate = (date: Date) => {
    const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : (date.getUTCMonth() + 1).toString();
    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate().toString();
    return `${date.getUTCFullYear().toString()}-${month}-${day}`;
  };

  const onSubmit = async (data: any) => {
    const { name, projectLeadId, projectManagerId, startDate, duration, wbsElementStatus, crId, dependencies } = data;
    const expectedActivities = mapBulletsToPayload(data.expectedActivities);
    const deliverables = mapBulletsToPayload(data.deliverables);

    try {
      const payload = {
        projectLeadId,
        projectManagerId,
        workPackageId: workPackage.id,
        userId,
        name,
        crId: parseInt(crId),
        startDate: transformDate(startDate),
        duration,
        dependencies: dependencies.map((dep: any) => {
          return validateWBS(dep.wbsNum);
        }),
        expectedActivities: expectedActivities,
        deliverables: deliverables,
        wbsElementStatus: wbsElementStatus
      };
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
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
      <Box textAlign="center" sx={{ my: 2 }}>
        <Button variant="contained" color="success" type="submit" sx={{ mx: 2 }}>
          Submit
        </Button>
        <Button variant="contained" color="error" onClick={exitEditMode} sx={{ mx: 2 }}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default WorkPackageEditContainer;
