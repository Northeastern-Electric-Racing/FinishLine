import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllWorkPackageTemplates } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import { getProjectLevelTemplates, shouldDisableStartDate } from '../../../utils/work-package.utils';
import { Control, Controller, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { Box } from '@mui/system';
import { Grid, Typography, Tooltip, IconButton, FormControl, FormLabel, TextField, Select, MenuItem } from '@mui/material';
import { Clear, Info } from '@mui/icons-material';
import { ProjectLevelTemplate } from 'shared';
import { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { ProjectFormInput, ProjectFormWorkPackageInput } from './ProjectForm';
import dayjs from 'dayjs';
import { generateUUID } from '../../../utils/form';

interface ProjectLevelTemplateSectionProps {
  control: Control<ProjectFormInput>;
  appendWorkPackage: UseFieldArrayAppend<any, 'workPackages'>;
  removeWorkPackage: UseFieldArrayRemove;
  workPackages: ProjectFormWorkPackageInput[];
}

const ProjectLevelTemplateSection: React.FC<ProjectLevelTemplateSectionProps> = ({
  control,
  appendWorkPackage,
  removeWorkPackage,
  workPackages
}) => {
  const {
    data: allTemplates,
    isLoading: allTemplatesIsLoading,
    isError: allTemplatesIsError,
    error: allTemplatesError
  } = useAllWorkPackageTemplates();

  const idToNameMap = useMemo(() => new Map<string, string>(), []);

  const [currentTemplate, setCurrentTemplate] = useState<ProjectLevelTemplate>();

  if (!allTemplates || allTemplatesIsLoading) return <LoadingIndicator />;

  if (allTemplatesIsError) return <ErrorPage message={allTemplatesError.message} />;

  const projectLevelTemplates = getProjectLevelTemplates(allTemplates);

  return (
    <Box>
      <Grid container direction={'row'} gap={1}>
        <Typography variant="h5" sx={{ marginBottom: '10px' }}>
          Apply a Project-Level Template
        </Typography>
        <Grid item mt={1}>
          <Tooltip
            placement="right"
            title="Work packages will be created from the template with given start dates. Edits can be made to the work packages after creation."
          >
            <Info fontSize="small" />
          </Tooltip>
        </Grid>
        <Grid item>
          <IconButton
            onClick={() => {
              currentTemplate?.smallTemplates.forEach((_template, _index) => removeWorkPackage(0));
              setCurrentTemplate(undefined);
            }}
          >
            <Clear />
          </IconButton>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', cursor: 'pointer' }}>
        {projectLevelTemplates.map((template) => (
          <Box
            key={template.templateName}
            onClick={() => {
              const idMap = new Map<string, string>();

              currentTemplate?.smallTemplates.forEach((_template, _index) => removeWorkPackage(0));
              template.smallTemplates
                .sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime())
                .forEach((smallTemplate) => {
                  const workPackageId = generateUUID();
                  idMap.set(smallTemplate.workPackageTemplateId, workPackageId);
                  idToNameMap.set(workPackageId, smallTemplate.workPackageName!);
                  appendWorkPackage({
                    name: smallTemplate.workPackageName,
                    stage: smallTemplate.stage,
                    duration: smallTemplate.duration,
                    startDate: new Date(),
                    id: workPackageId + 'skibidi',
                    blockedByIds: smallTemplate.blockedBy.map((blockedBy) => idMap.get(blockedBy.workPackageTemplateId))
                  });
                });
              setCurrentTemplate(template);
            }}
            sx={{
              width: '15em',
              height: '6em',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 1,
              borderColor: currentTemplate?.templateName === template.templateName ? 'red' : 'gray',
              borderWidth: 3,
              padding: 1,
              paddingLeft: 2,
              marginRight: 3,
              marginTop: 2,
              marginBottom: 2
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>{template.templateName}</Typography>
            <Typography>{template.templateNotes}</Typography>
          </Box>
        ))}
      </Box>
      {currentTemplate && (
        <Grid container gap={2} direction={'column'}>
          {workPackages.map((workPackage, index) => {
            return (
              <Box>
                <Typography variant="h6">Work Package {index + 1}</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Name</FormLabel>
                      <Controller
                        control={control}
                        name={`workPackages.${index}.name`}
                        render={({ field: { onChange } }) => (
                          <TextField disabled onChange={onChange} value={workPackage.name} />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Stage</FormLabel>
                      <Controller
                        control={control}
                        name={`workPackages.${index}.stage`}
                        render={({ field: { onChange } }) => (
                          <TextField disabled onChange={onChange} value={workPackage.stage} />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <FormLabel>Start Date</FormLabel>
                      <Controller
                        name={`workPackages.${index}.startDate`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <DatePicker
                            onChange={(date) => onChange(date ?? new Date())}
                            value={workPackage.startDate}
                            shouldDisableDate={shouldDisableStartDate}
                            slotProps={{
                              textField: {
                                autoComplete: 'off'
                              }
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <FormLabel>Duration (weeks)</FormLabel>
                      <Controller
                        control={control}
                        name={`workPackages.${index}.duration`}
                        render={({ field: { onChange } }) => (
                          <TextField disabled onChange={onChange} value={workPackage.duration} />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <FormLabel>Calculated End Date</FormLabel>
                      <TextField
                        disabled
                        value={dayjs(workPackage.startDate)
                          .add(7 * workPackage.duration, 'day')
                          .toDate()
                          .toLocaleDateString()}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel>Blocked By</FormLabel>
                      <Controller
                        control={control}
                        name={`workPackages.${index}.blockedByIds`}
                        render={({ field: { onChange } }) => {
                          return (
                            <Select multiple disabled onChange={onChange} value={workPackage.blockedByIds}>
                              {workPackage.blockedByIds.map((id) => {
                                return <MenuItem value={id}>{idToNameMap.get(id)}</MenuItem>;
                              })}
                            </Select>
                          );
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectLevelTemplateSection;
