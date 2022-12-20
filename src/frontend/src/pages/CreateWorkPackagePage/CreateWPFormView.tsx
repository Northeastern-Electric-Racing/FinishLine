/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
import { IconButton, useTheme } from '@mui/material';
import ReactHookEditableList from '../../components/ReactHookEditableList';
import DeleteIcon from '@mui/icons-material/Delete';
import { bulletsToObject } from '../../utils/form';
import { wbsPipe } from '../../utils/pipes';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  wbsNum: yup.string().required('WBS Number is required'),
  crId: yup
    .number()
    .typeError('CR ID must be a number')
    .required('CR ID is required')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1'),
  startDate: yup.date().required('Start Date is required'),
  duration: yup
    .number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .integer('Duration must be an integer')
    .min(1, 'Duration must be greater than or equal to 1')
});

interface CreateWPFormViewProps {
  allowSubmit: boolean;
  onSubmit: (data: any) => void;
  onCancel: (e: any) => void;
}

const CreateWPFormView: React.FC<CreateWPFormViewProps> = ({ allowSubmit, onSubmit, onCancel }) => {
  const theme = useTheme();
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
      wbsNum: query.get('wbs'),
      crId: Number(query.get('crId')),
      startDate: new Date(),
      duration: null,
      dependencies: [].map((dep) => {
        const wbsNum = wbsPipe(dep);
        return { wbsNum };
      }),
      expectedActivities: bulletsToObject([]),
      deliverables: bulletsToObject([])
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

  const style = { border: '1px solid ' + theme.palette.divider, borderRadius: 2 };

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
          <Grid item xs={9}>
            <Box>
              <Typography variant="caption">Work Package Name</Typography>
            </Box>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter work package name..."
              errorMessage={errors.name}
              fullWidth
              sx={style}
            />
          </Grid>
          <Grid item xs={3}>
            <Box>
              <Typography variant="caption">Change Request ID</Typography>
            </Box>
            <ReactHookTextField
              name="crId"
              control={control}
              placeholder="Enter change request ID..."
              errorMessage={errors.crId}
              type="number"
              sx={style}
            />
          </Grid>
          <Grid item xs={2}>
            <Box>
              <Typography variant="caption">Project WBS Number</Typography>
            </Box>
            <ReactHookTextField
              name="wbsNum"
              control={control}
              placeholder="Enter project WBS number..."
              errorMessage={errors.wbsNum}
              sx={style}
            />
          </Grid>
          <Grid item xs={2}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Box>
                    <Typography variant="caption">Start Date (YYYY-MM-DD)</Typography>
                  </Box>
                  <DatePicker
                    inputFormat="yyyy-MM-dd"
                    onChange={onChange}
                    className={'padding: 10'}
                    value={value}
                    renderInput={(params) => <TextField autoComplete="off" {...params} />}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={2}>
            <Box>
              <Typography variant="caption">Duration</Typography>
            </Box>
            <ReactHookTextField
              name="duration"
              control={control}
              placeholder="Enter duration..."
              errorMessage={errors.duration}
              type="number"
              endAdornment={<InputAdornment position="end">weeks</InputAdornment>}
              sx={style}
            />
          </Grid>
          <Grid item xs={12}>
            <Box marginBottom={1}>
              <Typography variant="caption">Dependencies</Typography>
            </Box>
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
            <Button variant="contained" color="success" onClick={() => appendDependency({ wbsNum: '' })} sx={{ my: 2 }}>
              + ADD NEW DEPENDENCY
            </Button>
            <Box marginBottom={1}>
              <Typography variant="caption">Expected Activities</Typography>
            </Box>
            <ReactHookEditableList
              name="expectedActivities"
              register={register}
              ls={expectedActivities}
              append={appendExpectedActivity}
              remove={removeExpectedActivity}
            />
            <Box marginBottom={1}>
              <Typography variant="caption">Deliverables</Typography>
            </Box>
            <ReactHookEditableList
              name="deliverables"
              register={register}
              ls={deliverables}
              append={appendDeliverable}
              remove={removeDeliverable}
            />
          </Grid>
        </Grid>
        <Box display="flex" flexDirection="row-reverse" gap={2}>
          <Button variant="contained" color="primary" type="submit" disabled={!allowSubmit}>
            Create
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </PageBlock>
    </form>
  );
};

export default CreateWPFormView;
