import {
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Box, display, Stack } from '@mui/system';
import { WorkPackageApiInputs } from '../../../apis/work-packages.api';
import { WorkPackageFormViewPayload } from '../../WorkPackageForm/WorkPackageFormView';
import {
  Control,
  Controller,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormWatch
} from 'react-hook-form';
import { ProjectFormInput } from './ProjectForm';
import { NERButton } from '../../../components/NERButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { generateUUID } from '../../../utils/form';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, DatePickerToolbar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { max, set } from 'date-fns';
import { getMonday } from '../../../utils/datetime.utils';
import { WorkPackageStage } from 'shared';
import { displayEnum } from '../../../utils/pipes';
import { Delete } from '@mui/icons-material';

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
  watch,
  control,
  register,
  append,
  remove,
  errors
}) => {
  const workPackages = watch('workPackages');

  const [startDatesUpdatedAt, setStartDatesUpdatedAt] = useState(new Date());
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const shouldDisableDate = (day: Date, index: number) => {
    const { blockedBy } = workPackages[index];
    const idToEndDateMap = workPackages.reduce(
      (acc, wp) => {
        acc[wp.workPackageId] = dayjs(wp.startDate).add(7 * wp.duration, 'day');
        return acc;
      },
      {} as Record<string, dayjs.Dayjs>
    );

    const possibleDates = [...blockedBy.filter((id) => idToEndDateMap[id]).map((id) => idToEndDateMap[id].toDate())];
    const latestEndDate = max(possibleDates);

    return day.getDay() !== 1 || (latestEndDate && dayjs(day).isBefore(latestEndDate));
  };

  const getNewStartDate = useCallback(
    (index: number) => {
      const idToEndDateMap = workPackages.reduce(
        (acc, wp) => {
          acc[wp.workPackageId] = dayjs(wp.startDate).add(7 * wp.duration, 'day');
          return acc;
        },
        {} as Record<string, dayjs.Dayjs>
      );

      const { blockedBy } = workPackages[index];
      const possibleDates = [
        ...blockedBy.filter((id) => idToEndDateMap[id]).map((id) => idToEndDateMap[id].toDate()),
        workPackages[index].startDate
      ];

      return max(possibleDates) ?? getMonday(new Date());
    },
    [workPackages]
  );

  useEffect(() => {
    (workPackages ?? []).forEach((_, index) => {
      workPackages[index].startDate = getNewStartDate(index);
    });
    forceUpdate();
  }, [getNewStartDate, startDatesUpdatedAt, workPackages]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Work Packages</Typography>
      {(workPackages ?? []).map((wp, index) => (
        <Grid container direction="column" spacing={2}>
          <Stack spacing={1} alignItems="center" direction="row">
            <Typography variant="h6">Work Package {index + 1}</Typography>
            <IconButton onClick={() => remove(index)}>
              <Delete />
            </IconButton>
          </Stack>
          <Grid container direction="row">
            <Grid size={6}>
              <ReactHookTextField fullWidth control={control} name={`workPackages.${index}.name`} label="Name" required />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name={`workPackages.${index}.stage`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField select onChange={onChange} value={value} fullWidth label="Stage">
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
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Tooltip
              placement="top"
              arrow
              title="Start date must be a Monday and not before the end dates of the blocking work packages"
            >
              <Grid size={4}>
                <DatePicker
                  shouldDisableDate={(day) => shouldDisableDate(day, index)}
                  sx={{ width: '100%' }}
                  label="Start Date *"
                  value={wp.startDate}
                  onChange={(date) => {
                    setStartDatesUpdatedAt(new Date());
                    workPackages[index].startDate = date!;
                  }}
                  slotProps={{
                    textField: {
                      error: !!errors.workPackages?.[index]?.startDate,
                      helperText: errors.workPackages?.[index]?.startDate?.message
                    }
                  }}
                  format="MM/dd/yyyy"
                />
              </Grid>
            </Tooltip>
            <Grid size={4}>
              <ReactHookTextField
                fullWidth
                control={control}
                name={`workPackages.${index}.duration`}
                label="Duration"
                type="number"
                required
                customOnChange={() => {
                  setStartDatesUpdatedAt(new Date());
                }}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                disabled
                label="Calculated End Date"
                value={dayjs(workPackages[index].startDate)
                  .add(7 * workPackages[index].duration, 'day')
                  .toDate()
                  .toLocaleDateString()}
              ></TextField>
            </Grid>
          </Grid>
          <FormControl>
            <InputLabel id={`blockedBy-label-${index}`}>Blocked By</InputLabel>
            <Controller
              name={`workPackages.${index}.blockedBy`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  sx={{ width: '100%' }}
                  labelId={`blockedBy-label-${index}`}
                  id={`blockedBy-${index}`}
                  multiple
                  fullWidth
                  value={value}
                  label="Blocked By"
                  onChange={(e) => {
                    const change = onChange(e.target.value as string[]);
                    workPackages[index].startDate = getNewStartDate(index);
                    return change;
                  }}
                  disabled={workPackages.length === 1}
                >
                  {workPackages
                    .map((workPackage, i) => (
                      <MenuItem key={workPackage.workPackageId} value={workPackage.workPackageId}>
                        {workPackage.name || `Work Package ${i + 1}`}
                      </MenuItem>
                    ))
                    .filter((wp) => wp.key !== workPackages[index].workPackageId)}
                </Select>
              )}
            />
          </FormControl>
        </Grid>
      ))}
      <NERButton
        onClick={() =>
          append({
            workPackageId: generateUUID(),
            name: '',
            startDate: getMonday(new Date()),
            duration: 0,
            stage: 'NONE',
            blockedBy: [],
            descriptionBullets: []
          })
        }
        variant="contained"
        color="primary"
      >
        Add Work Package
      </NERButton>
    </Stack>
  );
};

export default ProjectFormWorkPackageSection;
