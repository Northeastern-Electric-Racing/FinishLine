import * as yup from 'yup';
import { SponsorPayload, useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Control, Controller, FieldErrors, useFieldArray } from 'react-hook-form';
import { Sponsor } from 'shared';
import { FormControl, Grid, FormHelperText, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllUsers } from '../../../hooks/users.hooks';
import NERAutocomplete from '../../../components/NERAutocomplete';
import React, { useState } from 'react';
import { Box, useTheme } from '@mui/system';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface SponsorFormModalProps {
  control: Control<SponsorPayload>;
  errors: FieldErrors<SponsorPayload>;
  defaultValues?: Sponsor;
}

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
  vendorContact: yup.string().required('Vendor contact is required'),
  taxExempt: yup.boolean().required('Tax exempt is required'),
  discountCode: yup.string(),
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

export const SponsorForm: React.FC<SponsorFormModalProps> = ({ control, errors, defaultValues }: SponsorFormModalProps) => {
  const theme = useTheme();

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
    <Grid container justifyContent="space-between" alignItems="flex-start">
      <FormControl>
        <Typography variant="h5">Sponsor Name:*</Typography>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} placeholder="Enter Name" />
        <FormHelperText error> {errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Status:*</Typography>
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
                return <Typography sx={{ color: 'gray' }}>Select status</Typography>;
              }}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          )}
        ></Controller>
        <FormHelperText>{errors.activeStatus?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Value:*</Typography>
        <ReactHookTextField
          placeholder={'Enter Value'}
          name="sponsorValue"
          type="number"
          control={control}
          sx={{ width: 1 }}
          errorMessage={errors.sponsorValue}
        />
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Active Years:*</Typography>
        <ReactHookTextField
          name="activeYears"
          control={control}
          sx={{ width: 1 }}
          placeholder="Enter Sponsor Active Years"
        />
        <FormHelperText error> {errors.activeYears?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Join Date:*</Typography>
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
        <FormHelperText error>{errors.joinDate?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Tier:*</Typography>
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
                return tier ? tier.name : <Typography sx={{ color: 'gray' }}>Select sponsor tier</Typography>;
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
      <FormControl>
        <Typography variant="h5">Contact Name:*</Typography>
        <Controller
          control={control}
          name={'vendorContact'}
          render={({ field: { onChange } }) => (
            <NERAutocomplete
              sx={{ width: '100%', backgroundColor: theme.palette.grey[750] }}
              id="sponsor-contact-name-autocomplete"
              onChange={(_event, newValue) => onChange(newValue ? newValue.id : undefined)}
              options={members.map((m) => ({ label: m.firstName + ' ' + m.lastName, id: m.userId }))}
              size="small"
              placeholder={!!defaultValues?.vendorContact ? defaultValues.vendorContact : 'Select member'}
            ></NERAutocomplete>
          )}
        ></Controller>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Tax Exempt:*</Typography>
        <Controller
          control={control}
          name={'taxExempt'}
          render={({ field: { onChange, value } }) => (
            <Select
              displayEmpty
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value === 'true')}
              error={!!errors.taxExempt}
              renderValue={(selected) => {
                if (selected === true) return 'Exempt';
                if (selected === false) return 'Not Exempt';
                return <Typography sx={{ color: 'gray' }}>Select status</Typography>;
              }}
            >
              <MenuItem value="true">Exempt</MenuItem>
              <MenuItem value="false">Not Exempt</MenuItem>
            </Select>
          )}
        ></Controller>
        <FormHelperText>{errors.taxExempt?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Discount Code:</Typography>
        <ReactHookTextField name="discountCode" control={control} sx={{ width: 1 }} placeholder="Enter Code" />
        <FormHelperText error> {errors.discountCode?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Typography variant="h5">Notes on Sponsor:</Typography>
        {fields.map((item, index) => (
          <Grid container spacing={0.5}>
            <Box key={item.id} sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <FormControl>
                <Typography variant="h6">Due Date:*</Typography>
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

              <FormControl>
                <Typography variant="h6">Notify Date:</Typography>
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

              <FormControl>
                <Typography variant="h6">Assign To:</Typography>

                <Controller
                  control={control}
                  name={`sponsorTasks.${index}.assigneeUserId`}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      displayEmpty
                      value={value !== undefined ? value : ''}
                      onChange={onChange}
                      renderValue={(selected) => {
                        const assignee = users.find((u) => u.userId === selected);
                        return assignee ? (
                          assignee.firstName + ' ' + assignee.lastName
                        ) : (
                          <Typography sx={{ color: 'gray' }}>Select assignee</Typography>
                        );
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
                      {users.map((user) => (
                        <MenuItem key={user.userId} value={user.userId}>
                          {user.firstName + ' ' + user.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText error>{errors.sponsorTasks?.[index]?.assigneeUserId?.message}</FormHelperText>
              </FormControl>

              <FormControl>
                <Typography variant="h6">Notes:*</Typography>
                <ReactHookTextField
                  name={`notesOnSponsor.${index}.notes`}
                  control={control}
                  sx={{ width: 1 }}
                  placeholder="Enter notes"
                />
                <FormHelperText error> {errors.sponsorTasks?.[index]?.notes?.message}</FormHelperText>
              </FormControl>

              <IconButton onClick={() => remove(index)}>
                <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Grid>
        ))}
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
          <Typography>Add Note</Typography>
        </IconButton>
      </FormControl>
    </Grid>
  );
};

export default sponsorSchema;
