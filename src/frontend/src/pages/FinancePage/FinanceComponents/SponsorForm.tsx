import * as yup from 'yup';
import { SponsorPayload, useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Control, Controller, FieldErrors, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  Grid,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  Autocomplete,
  TextField
} from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllUsers } from '../../../hooks/users.hooks';
import React, { useState } from 'react';
import { Box, useTheme } from '@mui/system';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { Sponsor } from 'shared';

interface SponsorFormProps {
  control: Control<SponsorPayload>;
  errors: FieldErrors<SponsorPayload>;
  defaultValues?: Sponsor;
}

const getYears = (startYear = 1950) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
};

const sponsorSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  activeStatus: yup.boolean().required('Sponsor status is required'),
  sponsorValue: yup.number().typeError('Sponsor value must be a number').required('Sponsor value is required'),
  joinDate: yup.date().required('Join date is required'),
  activeYears: yup
    .array()
    .of(yup.number().typeError('Active year must be a number').required('Active year is required'))
    .required('Active years are required'),
  sponsorTierId: yup.string().required('Sponsor tier is required'),
  sponsorContact: yup.string().required('Sponsor contact is required'),
  taxExempt: yup.boolean().required('Tax exempt is required'),
  discountCode: yup.string().trim().optional(),
  sponsorTasks: yup
    .array()
    .of(
      yup.object().shape({
        dueDate: yup.date().required('Due date is required'),
        notifyDate: yup.date(),
        assigneeUserId: yup.string(),
        notes: yup.string().required('Notes are required')
      })
    )
    .required('Sponsor Tasks are Required')
});

export const SponsorForm: React.FC<SponsorFormProps> = ({ control, errors, defaultValues }: SponsorFormProps) => {
  const theme = useTheme();
  const yearsOptions = getYears();

  const [datePickerOpenNotify, setDatePickerOpenNotify] = useState(false);
  const [datePickerOpenJoin, setDatePickerOpenJoin] = useState(false);
  const [datePickerOpenDue, setDatePickerOpenDue] = useState(false);

  const { isLoading: membersLoading, isError: membersIsError, error: membersError, data: members } = useAllUsers();

  const {
    isLoading: sponsorTierIsLoading,
    isError: sponsorTierIsError,
    error: sponsorTierError,
    data: allSponsorTiers
  } = useGetAllSponsorTiers();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sponsorTasks'
  });

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();

  if (membersIsError) return <ErrorPage message={membersError?.message}></ErrorPage>;
  if (sponsorTierIsError) return <ErrorPage message={sponsorTierError?.message}></ErrorPage>;
  if (membersLoading || !members || !allSponsorTiers || sponsorTierIsLoading || !users || allUsersIsLoading)
    return <LoadingIndicator />;
  if (allUsersIsError) return <ErrorPage message={allUsersError?.message}></ErrorPage>;

  return (
    <Grid container justifyContent="space-between" alignItems="flex-start" spacing={3}>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Name:*
          </Typography>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} placeholder="Enter Name" />
          <FormHelperText error> {errors.name?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Status:*
          </Typography>
          <Controller
            control={control}
            name={'activeStatus'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={(e) => onChange(e.target.value === 'true')}
                error={!!errors.activeStatus}
                renderValue={(selected) => {
                  if (selected === true) return 'Active';
                  if (selected === false) return 'Inactive';
                  return <Typography sx={{ color: 'gray' }}>Select Status</Typography>;
                }}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            )}
          ></Controller>
          <Typography>
            <FormHelperText sx={{ color: '#ef4345' }}>{errors.activeStatus?.message}</FormHelperText>
          </Typography>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Value:*
          </Typography>
          <ReactHookTextField
            placeholder={'Enter Value'}
            name="sponsorValue"
            type="number"
            control={control}
            sx={{ width: 1 }}
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.sponsorValue}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Join Date:*
          </Typography>
          <Controller
            name="joinDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={new Date(value)}
                open={datePickerOpenJoin}
                onClose={() => setDatePickerOpenJoin(false)}
                onOpen={() => setDatePickerOpenJoin(true)}
                onChange={(newValue) => {
                  onChange(newValue ?? new Date());
                }}
                slotProps={{
                  textField: {
                    error: !!errors.joinDate,
                    helperText: errors.joinDate?.message,
                    onClick: () => setDatePickerOpenJoin(true)
                  }
                }}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={8}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Active Years:*
          </Typography>
          <Controller
            name="activeYears"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                options={yearsOptions}
                getOptionLabel={(option) => option.toString()}
                onChange={(_, data) => field.onChange(data)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Sponsor Active Years" error={!!errors.activeYears} />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                disableCloseOnSelect
              />
            )}
          />

          <FormHelperText error>{errors.activeYears?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl sx={{ width: '75%' }}>
          <Typography variant="h5" color="#EF4345">
            Sponsor Tier:*
          </Typography>
          <Controller
            control={control}
            name={'sponsorTierId'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                renderValue={(selected) => {
                  const tier = allSponsorTiers.find((t) => t.sponsorTierId === selected);
                  return tier ? tier.name : <Typography sx={{ color: 'gray' }}>Select Sponsor Tier</Typography>;
                }}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {allSponsorTiers.map((tier) => (
                  <MenuItem key={tier.sponsorTierId} value={tier.sponsorTierId}>
                    {tier.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.sponsorTierId?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Contact:*
          </Typography>
          <ReactHookTextField
            name="sponsorContact"
            control={control}
            sx={{ width: 1 }}
            placeholder="Enter Sponsor Contact"
          />
          <FormHelperText error> {errors.sponsorContact?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345" sx={{ textAlign: 'left', mt: 1 }}>
            Tax Exempt:
          </Typography>
          <Box sx={{ display: 'flex', mr: 30, justifyContent: 'center', mt: 2 }}>
            <Controller
              control={control}
              name="taxExempt"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  color="primary"
                  sx={{ p: 0, scale: 1.25 }}
                />
              )}
            />
          </Box>

          <FormHelperText error sx={{ ml: 0 }}>
            {errors.taxExempt?.message}
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl sx={{ width: '75%' }}>
          <Typography variant="h5" color="#EF4345">
            Discount Code:
          </Typography>
          <ReactHookTextField name="discountCode" control={control} sx={{ width: 1 }} placeholder="Enter Code" />
          <FormHelperText error> {errors.discountCode?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345" sx={{ mb: 1 }}>
            Sponsor Tasks:
          </Typography>
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Grid xs={12} sm={2.6}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Due Date:*
                  </Typography>
                  <Controller
                    name={`sponsorTasks.${index}.dueDate`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={value ? new Date(value) : null}
                        open={datePickerOpenDue}
                        onClose={() => setDatePickerOpenDue(false)}
                        onOpen={() => setDatePickerOpenDue(true)}
                        onChange={(newValue) => {
                          onChange(newValue ?? new Date());
                        }}
                        slotProps={{
                          textField: {
                            error: !!errors.sponsorTasks?.[index]?.dueDate,
                            helperText: errors.sponsorTasks?.[index]?.dueDate?.message,
                            onClick: () => setDatePickerOpenDue(true)
                          }
                        }}
                      />
                    )}
                  />
                  <FormHelperText error>{errors.sponsorTasks?.[index]?.dueDate?.message}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={2.6}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Notify Date:
                  </Typography>
                  <Controller
                    name={`sponsorTasks.${index}.notifyDate`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={value ? new Date(value) : null}
                        open={datePickerOpenNotify}
                        onClose={() => setDatePickerOpenNotify(false)}
                        onOpen={() => setDatePickerOpenNotify(true)}
                        onChange={(newValue) => {
                          onChange(newValue ?? new Date());
                        }}
                        slotProps={{
                          textField: {
                            error: !!errors.sponsorTasks?.[index]?.notifyDate,
                            helperText: errors.sponsorTasks?.[index]?.notifyDate?.message,
                            onClick: () => setDatePickerOpenNotify(true)
                          }
                        }}
                      />
                    )}
                  />
                  <FormHelperText error>{errors.sponsorTasks?.[index]?.notifyDate?.message}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={2.75}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Assign To:
                  </Typography>
                  <Controller
                    control={control}
                    name={`sponsorTasks.${index}.assigneeUserId`}
                    render={({ field: { onChange } }) => (
                      <NERAutocomplete
                        sx={{ width: '100%', backgroundColor: theme.palette.grey[750] }}
                        id="sponsor-task-assignee-name-autocomplete"
                        onChange={(_event, newValue) => onChange(newValue ? newValue.id : undefined)}
                        options={members.map((m) => ({ label: m.firstName + ' ' + m.lastName, id: m.userId }))}
                        size="small"
                        placeholder={
                          !!defaultValues?.sponsorTasks?.[index]?.assignee
                            ? defaultValues.sponsorTasks[index].assignee.firstName +
                              ' ' +
                              defaultValues.sponsorTasks[index].assignee.lastName
                            : 'Select Member'
                        }
                      ></NERAutocomplete>
                    )}
                  ></Controller>

                  <FormHelperText error>{errors.sponsorTasks?.[index]?.assigneeUserId?.message}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={3.84}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl fullWidth>
                    <Typography variant="h6" color="#EF4345">
                      Notes:*
                    </Typography>
                    <ReactHookTextField
                      name={`sponsorTasks.${index}.notes`}
                      control={control}
                      sx={{ width: 1 }}
                      placeholder="Enter notes"
                    />
                    <FormHelperText error> {errors.sponsorTasks?.[index]?.notes?.message}</FormHelperText>
                  </FormControl>
                  <Box sx={{ height: 17 }}>
                    <IconButton onClick={() => remove(index)}>
                      <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Box>
          ))}
          <Box sx={{ mt: 2 }}>
            <IconButton
              onClick={() =>
                append({
                  dueDate: new Date(),
                  notifyDate: undefined,
                  assigneeUserId: undefined,
                  notes: ''
                })
              }
            >
              <AddCircleOutlineIcon />
              <Typography>Add Sponsor Task</Typography>
            </IconButton>
          </Box>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default sponsorSchema;
