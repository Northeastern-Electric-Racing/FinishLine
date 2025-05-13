import * as yup from 'yup';
import { EditSponsorPayload, useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Sponsor } from 'shared';
import { useToast } from '../../../hooks/toasts.hooks';
import NERFormModal from '../../../components/NERFormModal';
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
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: Sponsor;
  onSubmit: (data: EditSponsorPayload) => void;
  // sponsors: Sponsor[];
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  sponsorStatus: yup.boolean().required('Sponsor Status is required'),
  sponsorValue: yup.number().typeError('Sponsor value must be a number').required('Sponsor value is required'),
  sponsorJoinDate: yup.date().required('Sponsor join date is required'),
  sponsorActiveYears: yup
    .array()
    .of(yup.number().typeError('Active Year must be a number').required('Year is required'))
    .required('Sponsor active years is required'),
  sponsorTier: yup.string().required('Sponsor tier is required'),
  contactName: yup.string().required('Contact name is required'),
  taxExempt: yup.boolean().required('Tax exempt is required'),
  discountCode: yup.string(),
  notesOnSponsor: yup.array().of(
    yup.object().shape({
      dueDate: yup.date().required('Due date is required'),
      notifyDate: yup.date(),
      assigneeUserId: yup.string(),
      notes: yup.string().required('Notes are required')
    })
  )
});

export const SponsorFormModal: React.FC<SponsorFormModalProps> = ({
  showModal,
  handleClose,
  defaultValues,
  onSubmit
  // sponsors
}: SponsorFormModalProps) => {
  const theme = useTheme();

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      sponsorStatus: defaultValues?.activeStatus ?? false,
      sponsorValue: defaultValues?.sponsorValue ?? 0,
      sponsorJoinDate: defaultValues?.joinDate ?? new Date(),
      sponsorActiveYears: defaultValues?.activeYears ?? [],
      taxExempt: defaultValues?.taxExempt ?? false,
      discountCode: defaultValues?.discountCode ?? '',
      notesOnSponsor: defaultValues?.sponsorTasks ?? []
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
    name: 'notesOnSponsor'
  });

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();

  if (membersIsError) return <ErrorPage message={membersError?.message}></ErrorPage>;
  if (sponsorTierIsError) return <ErrorPage message={sponsorTierError?.message}></ErrorPage>;
  if (membersLoading || !members || !allSponsorTiers || sponsorTierIsLoading || !users || allUsersIsLoading)
    return <LoadingIndicator />;
  if (allUsersIsError) return <ErrorPage message={allUsersError?.message}></ErrorPage>;

  const onFormSubmit = async (data: EditSponsorPayload) => {
    try {
      await onSubmit(data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Sponsor' : 'Create Sponsor'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-sponsor-form' : 'create-sponsor-form'}
      showCloseButton
    >
      <Grid container justifyContent="space-between" alignItems="flex-start">
        <FormControl>
          <FormLabel>Sponsor Name</FormLabel>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} placeholder="Enter Name" />
          <FormHelperText error> {errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Sponsor Status</FormLabel>
          <Controller
            control={control}
            name={'sponsorStatus'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                error={!!errors.sponsorStatus}
                renderValue={(selected) => {
                  if (selected === true) return 'Active';
                  if (selected === false) return 'Inactive';
                  return <Typography sx={{ color: 'gray' }}>Select status</Typography>;
                }}
              >
                <MenuItem value="">Select status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            )}
          ></Controller>
          <FormHelperText>{errors.sponsorStatus?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Sponsor Value</FormLabel>
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
          <FormLabel>Sponsor Active Years</FormLabel>
          <ReactHookTextField
            name="sponsorActiveYears"
            control={control}
            sx={{ width: 1 }}
            placeholder="Enter Sponsor Active Years"
          />
          <FormHelperText error> {errors.sponsorActiveYears?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Sponsor Join Date</FormLabel>
          <Controller
            name="sponsorJoinDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={new Date(value)}
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onOpen={() => setDatePickerOpen(true)}
                onChange={(newValue) => {
                  onChange(newValue ?? new Date());
                }}
                slotProps={{
                  textField: {
                    error: !!errors.sponsorJoinDate,
                    helperText: errors.sponsorJoinDate?.message,
                    onClick: () => setDatePickerOpen(true)
                  }
                }}
              />
            )}
          />
          <FormHelperText error>{errors.sponsorJoinDate?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Sponsor Tier</FormLabel>
          <Controller
            control={control}
            name={'sponsorTier'}
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
          <FormHelperText error>{errors.sponsorTier?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Contact Name</FormLabel>
          <Controller
            control={control}
            name={'contactName'}
            render={({ field: { onChange } }) => (
              <NERAutocomplete
                sx={{ width: '100%', backgroundColor: theme.palette.background.paper }}
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
          <FormLabel>Tax Exempt</FormLabel>
          <Controller
            control={control}
            name={'taxExempt'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
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
          <FormLabel>Discount Code</FormLabel>
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
                  name={`notesOnSponsor.${index}.dueDate`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value ? new Date(value) : null}
                      open={datePickerOpen}
                      onClose={() => setDatePickerOpen(false)}
                      onOpen={() => setDatePickerOpen(true)}
                      onChange={(newValue) => {
                        onChange(newValue ?? new Date());
                      }}
                      slotProps={{
                        textField: {
                          error: !!errors.notesOnSponsor?.[index]?.dueDate,
                          helperText: errors.notesOnSponsor?.[index]?.dueDate?.message,
                          onClick: () => setDatePickerOpen(true)
                        }
                      }}
                    />
                  )}
                />
                <FormHelperText error>{errors.notesOnSponsor?.[index]?.dueDate?.message}</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Notify Date</FormLabel>
                <Controller
                  name={`notesOnSponsor.${index}.notifyDate`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value ? new Date(value) : null}
                      open={datePickerOpen}
                      onClose={() => setDatePickerOpen(false)}
                      onOpen={() => setDatePickerOpen(true)}
                      onChange={(newValue) => {
                        onChange(newValue ?? new Date());
                      }}
                      slotProps={{
                        textField: {
                          error: !!errors.notesOnSponsor?.[index]?.notifyDate,
                          helperText: errors.notesOnSponsor?.[index]?.notifyDate?.message,
                          onClick: () => setDatePickerOpen(true)
                        }
                      }}
                    />
                  )}
                />
                <FormHelperText error>{errors.notesOnSponsor?.[index]?.notifyDate?.message}</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Assign To</FormLabel>
                <Controller
                  control={control}
                  name={`notesOnSponsor.${index}.assigneeUserId`}
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
                <FormHelperText error>{errors.notesOnSponsor?.[index]?.assigneeUserId?.message}</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <ReactHookTextField
                  name={`notesOnSponsor.${index}.notes`}
                  control={control}
                  sx={{ width: 1 }}
                  placeholder="Enter notes"
                />
                <FormHelperText error> {errors.notesOnSponsor?.[index]?.notes?.message}</FormHelperText>
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
    </NERFormModal>
  );
};
