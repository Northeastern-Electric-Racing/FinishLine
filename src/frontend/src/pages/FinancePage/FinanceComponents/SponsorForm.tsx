import * as yup from 'yup';
import { useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Sponsor } from 'shared';
import { FormControl, Grid, FormHelperText, FormLabel, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllUsers } from '../../../hooks/users.hooks';
import NERAutocomplete from '../../../components/NERAutocomplete';
import React, { useState } from 'react';
import { Box, useTheme } from '@mui/system';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface SponsorFormModalProps {
  defaultValues?: Sponsor;
}

const sponsorSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  sponsorStatus: yup.boolean().required('Sponsor Status is required'),
  sponsorValue: yup.number().typeError('Sponsor value must be a number').required('Sponsor value is required'),
  sponsorJoinDate: yup.date().required('Sponsor join date is required'),
  sponsorActiveYears: yup
    .array()
    .of(yup.number().typeError('Active Year must be a number').required('Year is required'))
    .required('Sponsor active years is required'),
  sponsorTierId: yup.string().required('Sponsor tier is required'),
  contactName: yup.string().required('Contact name is required'),
  taxExempt: yup.boolean().required('Tax exempt is required'),
  discountCode: yup.string(),
  sponsorTasks: yup.array().of(
    yup.object().shape({
      dueDate: yup.date().required('Due date is required'),
      notifyDate: yup.date(),
      assigneeUserId: yup.string(),
      notes: yup.string().required('Notes are required')
    })
  )
});
// this is just the grid, just the visual, so none of the submission aspects are in here.
// create will be wrapped in ner modal that will deal with the submitting
// edit sponsor will be on the side page that will need to have some sort of submission
export const SponsorForm: React.FC<SponsorFormModalProps> = ({ defaultValues }: SponsorFormModalProps) => {
  const theme = useTheme();

  const [datePickerOpenNotify, setDatePickerOpenNotify] = useState(false);
  const [datePickerOpenJoin, setDatePickerOpenJoin] = useState(false);
  const [datePickerOpenDue, setDatePickerOpenDue] = useState(false);

  const {
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      sponsorStatus: defaultValues?.activeStatus ?? false,
      sponsorValue: defaultValues?.sponsorValue ?? 0,
      sponsorJoinDate: defaultValues?.joinDate ?? new Date(),
      sponsorActiveYears: defaultValues?.activeYears ?? [],
      taxExempt: defaultValues?.taxExempt ?? false,
      discountCode: defaultValues?.discountCode ?? '',
      sponsorTasks: defaultValues?.sponsorTasks ?? [],
      sponsorTierId: defaultValues?.tier?.sponsorTierId ?? ''
    }
  });

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
        <Typography sx={{ color: (theme) => theme.palette.primary.main }} variant="h5">
          Sponsor Name
        </Typography>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} placeholder="Enter Name" />
        <FormHelperText error> {errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Status</Typography>
        <Controller
          control={control}
          name={'sponsorStatus'}
          render={({ field: { onChange, value } }) => (
            <Select
              displayEmpty
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value === 'true')}
              error={!!errors.sponsorStatus}
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
        <FormHelperText>{errors.sponsorStatus?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Value</Typography>
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
        <Typography variant="h5">Sponsor Active Years</Typography>
        <ReactHookTextField
          name="sponsorActiveYears"
          control={control}
          sx={{ width: 1 }}
          placeholder="Enter Sponsor Active Years"
        />
        <FormHelperText error> {errors.sponsorActiveYears?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Join Date</Typography>
        <Controller
          name="sponsorJoinDate"
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
                  error: !!errors.sponsorJoinDate,
                  helperText: errors.sponsorJoinDate?.message,
                  onClick: () => setDatePickerOpenJoin(true)
                }
              }}
            />
          )}
        />
        <FormHelperText error>{errors.sponsorJoinDate?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <Typography variant="h5">Sponsor Tier</Typography>
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
        <Typography variant="h5">Contact Name</Typography>
        <Controller
          control={control}
          name={'contactName'}
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
        <Typography variant="h5">Tax Exempt</Typography>
        <Controller
          control={control}
          name={'taxExempt'}
          render={({ field: { onChange, value } }) => (
            <Select
              displayEmpty
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value === 'true')}
              error={!!errors.sponsorStatus}
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
        <Typography variant="h5">Discount Code</Typography>
        <ReactHookTextField name="discountCode" control={control} sx={{ width: 1 }} placeholder="Enter Code" />
        <FormHelperText error> {errors.discountCode?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>Notes on Sponsor</FormLabel>
        {fields.map((item, index) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <FormControl>
              <FormLabel>Due Date</FormLabel>
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
              <FormLabel>Notify Date</FormLabel>
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
              <FormLabel>Assign To</FormLabel>
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
              <FormLabel>Notes</FormLabel>
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
