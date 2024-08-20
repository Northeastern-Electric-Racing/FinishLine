import { FormControl, FormLabel, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import { ProjectLevelTemplateFormViewPayload } from './ProjectLevelTemplateFormView';
import { Control, Controller, FieldErrors, UseFieldArrayAppend } from 'react-hook-form';
import { WorkPackageStage } from 'shared';
import { WorkPackageStageTextPipe } from '../../utils/enum-pipes';
import { NERButton } from '../../components/NERButton';
import { generateUUID } from '../../utils/form';
import { Delete } from '@mui/icons-material';
import { SmallTemplatePayload } from './ProjectLevelTemplateFormView';

interface ProjectLevelTemplateFormDetailsProps {
  template: SmallTemplatePayload;
  index: number;
  control: Control<ProjectLevelTemplateFormViewPayload, any>;
  errors: FieldErrors<ProjectLevelTemplateFormViewPayload>;
  firstTemplate?: boolean;
  lastTemplate?: boolean;
  smallTemplateAppend: UseFieldArrayAppend<ProjectLevelTemplateFormViewPayload, 'smallTemplates'>;
  onRemove: (index: number) => void;
  blockedByOptions: { id: string; label: string }[];
  isValid: boolean;
}

const ProjectLevelTemplateFormDetails: React.FC<ProjectLevelTemplateFormDetailsProps> = ({
  template,
  index,
  control,
  errors,
  firstTemplate,
  lastTemplate,
  smallTemplateAppend,
  onRemove,
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
          <IconButton color="error" onClick={() => onRemove(index)}>
            <Delete />
          </IconButton>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Work Package Name</FormLabel>
          <Controller
            name={`smallTemplates.${index}.workPackageName`}
            control={control}
            render={({ field: { onChange } }) => (
              <TextField
                required
                placeholder="Enter work package name..."
                error={!!errors.smallTemplates}
                helperText={errors.smallTemplates && errors.smallTemplates[index]?.workPackageName}
                onChange={onChange}
                value={template.workPackageName}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Duration (weeks)</FormLabel>
          <Controller
            name={`smallTemplates.${index}.durationWeeks`}
            control={control}
            render={({ field: { onChange } }) => (
              <TextField
                required
                onChange={onChange}
                value={template.durationWeeks}
                error={!!errors.smallTemplates}
                helperText={errors.smallTemplates && errors.smallTemplates[index]?.durationWeeks}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <FormLabel>Work Package Stage</FormLabel>
          <Controller
            name={`smallTemplates.${index}.stage`}
            control={control}
            render={({ field: { onChange } }) => (
              <Select value={template.stage} onChange={onChange}>
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
              render={({ field: { onChange } }) => (
                <Select multiple value={template.blockedBy} onChange={onChange}>
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
            variant="contained"
            onClick={() => {
              smallTemplateAppend({
                templateId: generateUUID(),
                workPackageName: '',
                durationWeeks: 1,
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
