import { FormControl, FormLabel, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';
import { ProjectLevelTemplateFormViewPayload } from './ProjectLevelTemplateFormView';
import { Control, Controller, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { WorkPackageStage } from 'shared';
import { WorkPackageStageTextPipe } from '../../utils/enum-pipes';
import { NERButton } from '../../components/NERButton';
import { generateUUID } from '../../utils/form';
import { Delete } from '@mui/icons-material';

interface ProjectLevelTemplateFormDetailsProps {
  index: number;
  control: Control<ProjectLevelTemplateFormViewPayload, any>;
  errors: FieldErrors<ProjectLevelTemplateFormViewPayload>;
  firstTemplate?: boolean;
  lastTemplate?: boolean;
  smallTemplateAppend: UseFieldArrayAppend<ProjectLevelTemplateFormViewPayload, 'smallTemplates'>;
  smallTemplateRemove: UseFieldArrayRemove;
  blockedByOptions: { id: string; label: string }[];
  isValid: boolean;
}

const ProjectLevelTemplateFormDetails: React.FC<ProjectLevelTemplateFormDetailsProps> = ({
  index,
  control,
  errors,
  firstTemplate,
  lastTemplate,
  smallTemplateAppend,
  smallTemplateRemove,
  blockedByOptions,
  isValid
}) => {
  return (
    <Grid container rowSpacing={1} columnSpacing={2}>
      <Grid item container>
        <Grid item>
          <Typography variant="h5">Work Package {index + 1}</Typography>
        </Grid>
        {!(firstTemplate && lastTemplate) && (
          <IconButton color="error" onClick={() => smallTemplateRemove(index)}>
            <Delete />
          </IconButton>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Work Package Name</FormLabel>
          <ReactHookTextField
            name={`smallTemplates.${index}.workPackageName`}
            required
            control={control}
            placeholder="Enter work package name..."
            errorMessage={errors.smallTemplates && errors.smallTemplates[index]?.workPackageName}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Duration (weeks)</FormLabel>
          <ReactHookTextField
            name={`smallTemplates.${index}.durationWeeks`}
            required
            control={control}
            type="number"
            errorMessage={errors.smallTemplates && errors.smallTemplates[index]?.durationWeeks}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Work Package Stage</FormLabel>
          <Controller
            name={`smallTemplates.${index}.stage`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select value={value} onChange={onChange}>
                {[...Object.values(WorkPackageStage), 'NONE'].map((stage) => (
                  <MenuItem value={stage}>
                    {WorkPackageStageTextPipe(stage === 'NONE' ? undefined : (stage as WorkPackageStage))}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Grid>
      {!firstTemplate && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Blocked By</FormLabel>
            <Controller
              name={`smallTemplates.${index}.blockedBy`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select multiple value={value} onChange={onChange}>
                  {blockedByOptions.map((option) => (
                    <MenuItem value={option.id}>{option.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>
      )}
      {lastTemplate && (
        <Grid item xs={12}>
          <NERButton
            onClick={() => {
              smallTemplateAppend({
                templateId: generateUUID(),
                workPackageName: '',
                durationWeeks: 0,
                stage: 'NONE',
                blockedBy: []
              });
            }}
            disabled={!isValid}
          >
            Add Work Package
          </NERButton>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectLevelTemplateFormDetails;
