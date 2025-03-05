import { Grid2 as Grid, TextField, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { WorkPackageApiInputs } from '../../../apis/work-packages.api';
import { WorkPackageFormViewPayload } from '../../WorkPackageForm/WorkPackageFormView';
import {
  Control,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormWatch
} from 'react-hook-form';
import { ProjectFormInput } from './ProjectForm';
import { NERButton } from '../../../components/NERButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import React from 'react';
import { generateUUID } from '../../../utils/form';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface ProjectFormWorkPackageSectionProps {
  workPackages: WorkPackageFormViewPayload[];
  watch: UseFormWatch<ProjectFormInput>;
  control: Control<ProjectFormInput>;
  register: UseFormRegister<ProjectFormInput>;
  append: UseFieldArrayAppend<ProjectFormInput, 'workPackages'>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<ProjectFormInput>;
}

const ProjectFormWorkPackageSection: React.FC<ProjectFormWorkPackageSectionProps> = ({
  workPackages,
  watch,
  control,
  register,
  append,
  remove,
  errors
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Work Packages</Typography>
      {workPackages.map((wp, index) => (
        <Grid container direction="column" spacing={2}>
          <Grid container direction="row">
            <ReactHookTextField control={control} name={`workPackages.${index}.name`} label="Name" required />
            <ReactHookTextField control={control} name={`workPackages.${index}.stage`} label="Stage" required />
          </Grid>
          <Grid container direction="row">
            <DatePicker
              label="Start Date"
              value={wp.startDate}
              onChange={(date) => {
                const newWorkPackages = [...workPackages];
                newWorkPackages[index].startDate = date;
                watch('workPackages', newWorkPackages);
              }}
              slotProps={{
                textField: {
                  error: !!errors.workPackages?.[index]?.startDate,
                  helperText: errors.workPackages?.[index]?.startDate?.message
                }
              }}
            />
            <ReactHookTextField
              control={control}
              name={`workPackages.${index}.duration`}
              label="Duration"
              type="number"
              required
            />
            <TextField label='Calculated End Date' disabled>
              {dayjs(startDate)
                  .add(7 * duration, 'day')
                  .toDate();}
            </TextField>
          </Grid>
          <ReactHookTextField
            control={control}
            name={`workPackages.${index}.duration`}
            label="Duration"
            type="number"
            required
          />
          <NERButton onClick={() => remove(index)} variant="outlined" color="error" startIcon={<DeleteIcon />}>
            Remove
          </NERButton>
        </Grid>
      ))}
      <NERButton
        onClick={() =>
          append({
            workPackageId: generateUUID(),
            name: 'a',
            startDate: new Date(),
            duration: 0,
            stage: 'NONE',
            blockedBy: [],
            descriptionBullets: []
          })
        }
        variant="outlined"
        color="primary"
      >
        Add Work Package
      </NERButton>
    </Stack>
  );
};

export default ProjectFormWorkPackageSection;
