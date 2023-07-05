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
import { startDateTester } from '../../utils/form';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { Project, WorkPackageStage, wbsPipe } from 'shared';
import { CreateWorkPackageFormInputs } from './CreateWorkPackageForm';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllProjects } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  crId: yup
    .number()
    .typeError('CR ID must be a number')
    .required('CR ID is required')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1'),
  stage: yup.string(),
  startDate: yup
    .date()
    .required('Start Date is required')
    .test('start-date-valid', 'start date is not valid', startDateTester),
  duration: yup
    .number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .integer('Duration must be an integer')
    .min(1, 'Duration must be greater than or equal to 1')
});

interface CreateWorkPackageFormViewProps {
  allowSubmit: boolean;
  onSubmit: (data: CreateWorkPackageFormInputs) => void;
  onCancel: () => void;
  wbsNum: string;
  setWbsNum: (val: string) => void;
}

const CreateWorkPackageFormView: React.FC<CreateWorkPackageFormViewProps> = ({
  wbsNum,
  setWbsNum,
  allowSubmit,
  onSubmit,
  onCancel
}) => {
  const startDate = new Date();
  const today = startDate.getDay();
  if (today !== 1) {
    const daysUntilNextMonday = (7 - today + 1) % 7;
    startDate.setDate(startDate.getDate() + daysUntilNextMonday);
  }
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
      crId: Number(query.get('crId')),
      stage: 'NONE' as WorkPackageStage | 'None',
      startDate,
      duration: null,
      blockedBy: [] as { wbsNum: string }[],
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
  const { fields: blockedBy, append: appendBlocker, remove: removeBlocker } = useFieldArray({ control, name: 'blockedBy' });

  const disableStartDate = (startDate: Date) => {
    return startDate.getDay() !== 1;
  };

  const { data: projects, isLoading, error, isError } = useAllProjects();

  if (isLoading || !projects) return <LoadingIndicator />;

  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  const blockedByFormControl = (
    <FormControl fullWidth>
      <FormLabel>Blocked By</FormLabel>
      {blockedBy.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField required autoComplete="off" {...register(`blockedBy.${i}.wbsNum`)} sx={{ width: 9 / 10 }} />
            <IconButton type="button" onClick={() => removeBlocker(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}
      <Button
        variant="contained"
        color="success"
        onClick={() => appendBlocker({ wbsNum: '' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + ADD NEW BLOCKER
      </Button>
    </FormControl>
  );

  const wbsAutocompleteOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      setWbsNum(value.id);
    } else {
      setWbsNum('');
    }
  };

  const wbsDropdownOptions: { label: string; id: string }[] = [];
  projects.forEach((project: Project) => {
    wbsDropdownOptions.push({
      label: `${wbsPipe(project.wbsNum)} - ${project.name}`,
      id: wbsPipe(project.wbsNum)
    });
  });

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
          <Grid item xs={12} md={5}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <FormLabel>Work Package Stage</FormLabel>
              <Controller
                name="stage"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField select onChange={onChange} value={value}>
                    <MenuItem value={'NONE'} key={'NONE'}>
                      NONE
                    </MenuItem>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Project WBS Number</FormLabel>
              <NERAutocomplete
                id="wbs-autocomplete"
                onChange={wbsAutocompleteOnChange}
                options={wbsDropdownOptions}
                size="small"
                placeholder="Select a project or work package"
                value={wbsDropdownOptions.find((element) => element.id === wbsNum) || null}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
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
                    shouldDisableDate={disableStartDate}
                    renderInput={(params) => <TextField autoComplete="off" {...params} />}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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
            {blockedByFormControl}
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
