/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackageStage } from 'shared';
import { FormControl, FormLabel, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrorsImpl } from 'react-hook-form';
import { Box } from '@mui/system';
import ReactHookTextField from '../../components/ReactHookTextField';
import { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';

interface Props {
  control: Control<WorkPackageTemplateFormViewPayload>;
  errors: Partial<FieldErrorsImpl<WorkPackageTemplateFormViewPayload>>;
}

const WorkPackageTemplateFormDetails: React.FC<Props> = ({ control, errors }) => {
  const StageSelect = () => (
    <FormControl fullWidth>
      <FormLabel>Work Package Stage</FormLabel>
      <Controller
        name="stage"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField select onChange={onChange} value={value} fullWidth>
            <MenuItem value={'NONE'}>NONE</MenuItem>
            {Object.values(WorkPackageStage).map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </FormControl>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ marginBottom: '10px', color: 'white' }}>
        Work Package Details
      </Typography>
      <Grid container rowSpacing={2} spacing={1} xs={12}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Work Package Name</FormLabel>
            <ReactHookTextField
              name="workPackageName"
              control={control}
              placeholder="Enter work package name..."
              errorMessage={errors.workPackageName}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <StageSelect />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Duration</FormLabel>
            <ReactHookTextField
              name="duration"
              control={control}
              type="number"
              placeholder="Enter duration..."
              errorMessage={errors.duration}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Template Name</FormLabel>
            <ReactHookTextField
              name="templateName"
              control={control}
              placeholder="Enter template name..."
              errorMessage={errors.templateName}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Template Notes</FormLabel>
            <ReactHookTextField
              name="templateNotes"
              control={control}
              placeholder="Enter notes..."
              errorMessage={errors.templateNotes}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkPackageTemplateFormDetails;
