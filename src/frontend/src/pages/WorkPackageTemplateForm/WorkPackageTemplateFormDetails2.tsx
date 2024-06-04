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

const WorkPackageTemplateFormDetails2: React.FC<Props> = ({
  control,
  errors,
}) => {
  const userToOption = (user?: User): { label: string; id: string } => {
    if (!user) return { label: '', id: '' };
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ marginBottom: '10px', color: 'white' }}>
        Work Package Template Details
      </Typography>
      <Grid container rowSpacing={2} spacing={1} xs={12}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Template Name</FormLabel>
            <ReactHookTextField
              name="templateName"
              control={control}
              placeholder="Enter work package name..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Template Notes</FormLabel>
            <ReactHookTextField
              name="notes"
              control={control}
              placeholder="Enter duration..."
              errorMessage={errors.duration}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkPackageTemplateFormDetails2;
