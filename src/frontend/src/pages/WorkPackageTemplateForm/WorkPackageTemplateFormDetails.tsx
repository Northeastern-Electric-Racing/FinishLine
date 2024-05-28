/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WorkPackageStage } from 'shared';
import { FormControl, FormLabel, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrorsImpl } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { Box } from '@mui/system';
import ChangeRequestDropdown from '../../components/ChangeRequestDropdown';
import NERAutocomplete from '../../components/NERAutocomplete';
import ReactHookTextField from '../../components/ReactHookTextField';
import { fullNamePipe } from '../../utils/pipes';
import { WorkPackageTemplateFormViewPayload } from './WorkPackageTemplateFormView';

interface Props {
  control: Control<WorkPackageTemplateFormViewPayload>;
  errors: Partial<FieldErrorsImpl<WorkPackageTemplateFormViewPayload>>;
}

const WorkPackageTemplateFormDetails: React.FC<Props> = ({
  control,
  errors,
}) => {
  const userToOption = (user?: User): { label: string; id: string } => {
    if (!user) return { label: '', id: '' };
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

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
        Details
      </Typography>
      <Grid container rowSpacing={2} spacing={1} xs={12}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
          <StageSelect />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChangeRequestDropdown control={control} name="crId" />
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
      </Grid>
    </Box>
  );
};

export default WorkPackageTemplateFormDetails;
