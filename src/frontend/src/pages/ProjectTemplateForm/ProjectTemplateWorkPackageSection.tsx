import { Control, Controller, FieldErrors, UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';
import { ProjectTemplateApiInputs } from '../../apis/wbs-templates.api';
import { WorkPackageTemplateApiInputs } from 'shared';
import { Stack } from '@mui/system';
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';
import { WorkPackageStage } from 'shared';
import { displayEnum } from '../../utils/pipes';
import { Delete } from '@mui/icons-material';

interface ProjectTemplateWorkPackageSectionProps {
  workPackages: WorkPackageTemplateApiInputs[];
  index: number;
  register: UseFormRegister<ProjectTemplateApiInputs>;
  control: Control<ProjectTemplateApiInputs, any>;
  errors: FieldErrors<ProjectTemplateApiInputs>;
  removeWorkPackageTemplate: UseFieldArrayRemove;
}

const ProjectTemplateWorkPackageSection: React.FC<ProjectTemplateWorkPackageSectionProps> = ({
  workPackages,
  index,
  register,
  control,
  errors,
  removeWorkPackageTemplate
}: ProjectTemplateWorkPackageSectionProps) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">Work Package {index + 1}</Typography>
        <IconButton onClick={() => removeWorkPackageTemplate(index)}>
          <Delete />
        </IconButton>
      </Stack>
      <Stack spacing={2}>
        <FormControl>
          <ReactHookTextField
            {...register(`workPackageTemplates.${index}.workPackageName`)}
            label="Work Package Name"
            control={control}
            required={false}
            errorMessage={errors.workPackageTemplates?.[index]?.workPackageName}
          />
        </FormControl>
        <FormControl fullWidth>
          <Controller
            {...register(`workPackageTemplates.${index}.stage`)}
            name={`workPackageTemplates.${index}.stage`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField label="Stage" select onChange={onChange} value={value ?? 'NONE'} fullWidth>
                <MenuItem value={'NONE'}>None</MenuItem>
                {Object.values(WorkPackageStage).map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {displayEnum(stage)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </FormControl>
        <FormControl>
          <Controller
            {...register(`workPackageTemplates.${index}.duration`)}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                required={false}
                name={`workPackageTemplates.${index}.duration`}
                id={`workPackageTemplates.${index}.duration-input`}
                autoComplete="off"
                onChange={onChange}
                value={value}
                label="Duration"
                placeholder="Enter duration (weeks)"
                type="number"
                error={!!errors.workPackageTemplates?.[index]?.duration}
                helperText={errors.workPackageTemplates?.[index]?.duration?.message}
                onKeyPress={(e) => isNaN(Number(e.key)) && e.preventDefault()}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <InputLabel id={`blockedBy-label-${index}`}>Blocked By</InputLabel>
          <Controller
            name={`workPackageTemplates.${index}.blockedBy`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId={`blockedBy-label-${index}`}
                id={`blockedBy-${index}`}
                multiple
                fullWidth
                value={value}
                label="Blocked By"
                onChange={(e) => onChange(e.target.value as string[])}
                disabled={workPackages.length === 1}
              >
                {workPackages
                  .map((workPackage, i) => (
                    <MenuItem key={workPackage.workPackageTemplateId} value={workPackage.workPackageTemplateId}>
                      {workPackage.workPackageName ? workPackage.workPackageName : `Work Package ${i + 1}`}
                    </MenuItem>
                  ))
                  .filter((wp) => wp.key !== workPackages[index].workPackageTemplateId)}
              </Select>
            )}
          />
        </FormControl>
      </Stack>
    </Stack>
  );
};

export default ProjectTemplateWorkPackageSection;
