/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { routes } from '../../utils/routes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '../../hooks/utils.hooks';
import ReactHookTextField from '../../components/ReactHookTextField';
import { FormControl, FormLabel, IconButton } from '@mui/material';
import ReactHookEditableList from '../../components/ReactHookEditableList';
import DeleteIcon from '@mui/icons-material/Delete';
import { wbsTester } from '../../utils/form';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { WorkPackageStage } from 'shared';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  wbsNum: yup.string().required('WBS Number is required').test('wbs-num-valid', 'WBS Number is not valid', wbsTester),
  crId: yup
    .number()
    .typeError('CR ID must be a number')
    .required('CR ID is required')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1'),
  stage: yup.string(),
  startDate: yup.date().required('Start Date is required'),
  duration: yup
    .number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .integer('Duration must be an integer')
    .min(1, 'Duration must be greater than or equal to 1')
});

interface CreateWorkPackageFormViewProps {
  allowSubmit: boolean;
  onSubmit: (data: any) => void;
  onCancel: (e: any) => void;
}

const CreateWorkPackageFormView: React.FC<CreateWorkPackageFormViewProps> = ({ allowSubmit, onSubmit, onCancel }) => {
  const query = useQuery();
  const {
    handleSubmit,
    control,
    formState: { errors },
    register
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      wbsNum: query.get('wbs') || '',
      crId: Number(query.get('crId')),
      stage: '',
      startDate: new Date(),
      duration: null,
      dependencies: [] as { wbsNum: string }[],
      expectedActivities: [] as { bulletId: number; detail: string }[],
      deliverables: [] as { bulletId: number; detail: string }[]
    }
  });

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

  const dependenciesFormControl = (
    <FormControl fullWidth>
      <FormLabel>Dependencies</FormLabel>
      {dependencies.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField required autoComplete="off" {...register(`dependencies.${i}.wbsNum`)} sx={{ width: 9 / 10 }} />
            <IconButton type="button" onClick={() => removeDependency(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}
      <Button
        variant="contained"
        color="success"
        onClick={() => appendDependency({ wbsNum: '' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + ADD NEW DEPENDENCY
      </Button>
    </FormControl>
  );

  return (
    <form
      id={'create-work-package-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageTitle title={'New Work Package'} previousPages={[{ name: 'Work Packages', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <FormControl fullWidth>
              <FormLabel>Work Package Name</FormLabel>
              <ReactHookTextField
                name="name"
                control={control}
                placeholder="Enter work package name..."
                errorMessage={errors.name}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <FormLabel>Change Request ID</FormLabel>
              <ReactHookTextField
                name="crId"
                control={control}
                placeholder="Enter change request ID..."
                errorMessage={errors.crId}
                type="number"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Work Package Stage</FormLabel>
              <Controller
                name="stage"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField select onChange={onChange} value={value}>
                    <MenuItem value={''}>None</MenuItem>
                    {Object.values(WorkPackageStage).map((stage) => (
                      <MenuItem key={stage} value={stage}>
                        {stage}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Project WBS Number</FormLabel>
              <ReactHookTextField
                name="wbsNum"
                control={control}
                placeholder="Enter project WBS number..."
                errorMessage={errors.wbsNum}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    inputFormat="yyyy-MM-dd"
                    onChange={onChange}
                    className={'padding: 10'}
                    value={value}
                    renderInput={(params) => <TextField autoComplete="off" {...params} />}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Duration</FormLabel>
              <ReactHookTextField
                name="duration"
                control={control}
                placeholder="Enter duration..."
                errorMessage={errors.duration}
                type="number"
                endAdornment={<InputAdornment position="end">weeks</InputAdornment>}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
          <Grid item xs={12} md={2}>
            {dependenciesFormControl}
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <FormLabel>Expected Activities</FormLabel>
              <ReactHookEditableList
                name="expectedActivities"
                register={register}
                ls={expectedActivities}
                append={appendExpectedActivity}
                remove={removeExpectedActivity}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <FormLabel>Deliverables</FormLabel>
              <ReactHookEditableList
                name="deliverables"
                register={register}
                ls={deliverables}
                append={appendDeliverable}
                remove={removeDeliverable}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box textAlign="right" gap={2} sx={{ mt: 2 }}>
          <NERFailButton variant="outlined" onClick={onCancel} sx={{ mx: 1 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton variant="contained" type="submit" disabled={!allowSubmit} sx={{ mx: 1 }}>
            Create
          </NERSuccessButton>
        </Box>
      </PageBlock>
    </form>
  );
};

export default CreateWorkPackageFormView;
