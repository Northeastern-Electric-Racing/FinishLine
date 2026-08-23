import * as yup from 'yup';
import { SponsorPayload, useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Control, Controller, FieldErrors, FieldValues, UseFormSetValue, useFieldArray, useWatch } from 'react-hook-form';
import {
  FormControl,
  Grid,
  FormHelperText,
  Button,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  Autocomplete,
  TextField,
  Chip,
  Stack
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageIcon from '@mui/icons-material/Image';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllMembers } from '../../../hooks/users.hooks';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/system';
import { useToast } from '../../../hooks/toasts.hooks';
import { MAX_FILE_SIZE } from 'shared';
import { AddCircle } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SponsorTaskCard from './SponsorTaskCard';
import { Sponsor, SponsorValueType } from 'shared';

interface SponsorFormProps {
  control: Control<SponsorPayload>;
  errors: FieldErrors<SponsorPayload>;
  setValue: UseFormSetValue<SponsorPayload>;
  defaultValues?: Sponsor;
  onLogoImageChange?: (file: File | null) => void;
}

const getYears = (startYear = 1950) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
};

const VALUE_TYPE_OPTIONS = [
  { value: SponsorValueType.MONETARY, label: 'Monetary' },
  { value: SponsorValueType.STOCK, label: 'Stock/Parts/Services' },
  { value: SponsorValueType.DISCOUNT, label: 'Discount' }
];

const sponsorSchema = yup.object().shape(
  {
    name: yup.string().required('Name is required'),
    activeStatus: yup.boolean().required('Sponsor status is required'),
    valueTypes: yup
      .array()
      .of(yup.string().required())
      .min(1, 'At least one value type is required')
      .required('Value types are required'),
    sponsorValue: yup
      .number()
      .typeError('Sponsor value must be a number')
      .when('valueTypes', {
        is: (types: string[]) => types?.includes(SponsorValueType.MONETARY),
        then: (schema) => schema.required('Sponsor value is required for monetary sponsors'),
        otherwise: (schema) => schema.optional().nullable()
      }),
    stockDescription: yup.string().trim().optional(),
    discountDescription: yup.string().trim().optional(),
    joinDate: yup.date().required('Join date is required'),
    activeYears: yup
      .array()
      .of(yup.number().typeError('Active year must be a number').required('Active year is required'))
      .required('Active years are required'),
    sponsorTierId: yup.string().optional(),
    contactName: yup.string().required('Contact name is required'),
    contactEmail: yup
      .string()
      .email('Invalid email')
      .when('contactPhone', {
        is: (phone: string | undefined) => !phone,
        then: (schema) => schema.required('Email or phone is required'),
        otherwise: (schema) => schema.optional()
      }),
    contactPhone: yup.string().when('contactEmail', {
      is: (email: string | undefined) => !email,
      then: (schema) => schema.required('Email or phone is required'),
      otherwise: (schema) => schema.optional()
    }),
    contactPosition: yup.string().optional(),
    taxExempt: yup.boolean().required('Tax exempt is required'),
    discountCode: yup.string().trim().optional(),
    sponsorNotes: yup.string().trim().optional(),
    sponsorTasks: yup
      .array()
      .of(
        yup.object().shape({
          sponsorTaskId: yup.string().optional(),
          dueDate: yup.date().required('Due date is required'),
          notifyDate: yup.date().optional(),
          assigneeUserId: yup.string().optional(),
          notes: yup.string().required('Notes are required'),
          done: yup.boolean().optional()
        })
      )
      .required('Sponsor Tasks are Required'),
    logoImageId: yup.string().trim().optional()
  },
  [['contactEmail', 'contactPhone']]
);

export const SponsorForm: React.FC<SponsorFormProps> = ({
  control,
  errors,
  setValue,
  defaultValues,
  onLogoImageChange
}: SponsorFormProps) => {
  const yearsOptions = getYears();
  const toast = useToast();

  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [datePickerOpenJoin, setDatePickerOpenJoin] = useState(false);
  const { data: currentLogoUrl } = useGetImageUrl(defaultValues?.logoImageId ?? null);

  const { isLoading: membersLoading, isError: membersIsError, error: membersError, data: members } = useAllMembers();

  const {
    isLoading: sponsorTierIsLoading,
    isError: sponsorTierIsError,
    error: sponsorTierError,
    data: allSponsorTiers
  } = useGetAllSponsorTiers();

  const watchedValueTypes: string[] = useWatch({ control, name: 'valueTypes' }) ?? [];
  const isMonetary = watchedValueTypes.includes(SponsorValueType.MONETARY);
  const isStock = watchedValueTypes.includes(SponsorValueType.STOCK);
  const isDiscount = watchedValueTypes.includes(SponsorValueType.DISCOUNT);

  const watchedSponsorValue: number | undefined = useWatch({ control, name: 'sponsorValue' });
  const tierManuallySet = useRef(!!defaultValues);

  useEffect(() => {
    if (tierManuallySet.current || !allSponsorTiers || allSponsorTiers.length === 0) return;
    const value = watchedSponsorValue ?? 0;
    const sorted = [...allSponsorTiers].sort((a, b) => b.minSupportValue - a.minSupportValue);
    const bestTier = sorted.find((t) => value >= t.minSupportValue);
    if (bestTier) {
      setValue('sponsorTierId', bestTier.sponsorTierId);
    }
  }, [watchedSponsorValue, allSponsorTiers, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sponsorTasks'
  });

  if (membersIsError) return <ErrorPage message={membersError?.message}></ErrorPage>;
  if (sponsorTierIsError) return <ErrorPage message={sponsorTierError?.message}></ErrorPage>;
  if (membersLoading || !members || !allSponsorTiers || sponsorTierIsLoading) return <LoadingIndicator />;

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
            Value Types:*
          </Typography>
          <Controller
            control={control}
            name="valueTypes"
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                options={VALUE_TYPE_OPTIONS}
                getOptionLabel={(option) => option.label}
                value={VALUE_TYPE_OPTIONS.filter((opt) => value?.includes(opt.value))}
                onChange={(_, data) => onChange(data.map((d) => d.value))}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Value Types" error={!!errors.valueTypes} />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => <Chip label={option.label} {...getTagProps({ index })} size="small" />)
                }
                isOptionEqualToValue={(option, val) => option.value === val.value}
                disableCloseOnSelect
              />
            )}
          />
          <FormHelperText error>{errors.valueTypes?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Value:{isMonetary ? '*' : ''}
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
      {isStock && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Typography variant="h5" color="#EF4345">
              Stock/Parts/Services Description:
            </Typography>
            <ReactHookTextField
              name="stockDescription"
              control={control}
              placeholder="Describe stock/parts/services provided"
              multiline
              rows={2}
            />
          </FormControl>
        </Grid>
      )}
      {isDiscount && (
        <Grid item xs={12} sm={isMonetary || isStock ? 12 : 8}>
          <FormControl fullWidth>
            <Typography variant="h5" color="#EF4345">
              Discount Description:
            </Typography>
            <ReactHookTextField
              name="discountDescription"
              control={control}
              placeholder="Describe discount terms"
              multiline
              rows={2}
            />
          </FormControl>
        </Grid>
      )}
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
            Sponsor Tier:
          </Typography>
          <Controller
            control={control}
            name={'sponsorTierId'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={(e) => {
                  tierManuallySet.current = true;
                  onChange(e);
                }}
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
            Contact Name:*
          </Typography>
          <ReactHookTextField name="contactName" control={control} sx={{ width: 1 }} placeholder="Enter Contact Name" />
          <FormHelperText error> {errors.contactName?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Contact Email:
          </Typography>
          <ReactHookTextField name="contactEmail" control={control} sx={{ width: 1 }} placeholder="Enter Contact Email" />
          <FormHelperText error> {errors.contactEmail?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Contact Phone:
          </Typography>
          <ReactHookTextField name="contactPhone" control={control} sx={{ width: 1 }} placeholder="Enter Contact Phone" />
          <FormHelperText error> {errors.contactPhone?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Contact Position:
          </Typography>
          <ReactHookTextField
            name="contactPosition"
            control={control}
            sx={{ width: 1 }}
            placeholder="Enter Contact Position"
          />
          <FormHelperText error> {errors.contactPosition?.message}</FormHelperText>
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
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Logo:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              component="label"
              startIcon={<FileUploadIcon />}
              sx={{ width: 'fit-content', textTransform: 'none', color: 'black' }}
            >
              Upload Logo
              <input
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const [file] = e.target.files;
                    if (file.size > MAX_FILE_SIZE) {
                      toast.error(`File "${file.name}" exceeds the maximum size limit of ${MAX_FILE_SIZE / 1024 / 1024} MB`);
                      return;
                    }
                    setLogoImage(file);
                    onLogoImageChange?.(file);
                  }
                }}
                type="file"
                accept="image/png, image/jpeg"
                hidden
              />
            </Button>
            {logoImage && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ImageIcon />
                <Typography>{logoImage.name}</Typography>
              </Stack>
            )}
          </Box>
          {!logoImage && currentLogoUrl && (
            <Box component="img" src={currentLogoUrl} alt="Sponsor Logo" sx={{ maxWidth: '200px', mt: 1 }} />
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Sponsor Notes:
          </Typography>
          <ReactHookTextField
            name="sponsorNotes"
            control={control}
            placeholder="Enter Additional Information"
            multiline
            rows={4}
          />
          <FormHelperText error> {errors.sponsorNotes?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345" sx={{ mb: 1 }}>
            Sponsor Tasks:
          </Typography>
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ mt: 1 }}>
              <SponsorTaskCard
                // react-hook-form Control is invariant, so widening requires casting through unknown
                control={control as unknown as Control<FieldValues>}
                errors={errors as unknown as FieldErrors<FieldValues>}
                fieldPrefix={`sponsorTasks.${index}`}
                members={members}
                onRemove={() => remove(index)}
                showDoneCheckbox
                isExistingTask={!!defaultValues?.sponsorTasks?.[index]?.sponsorTaskId}
                defaultAssigneeName={
                  defaultValues?.sponsorTasks?.[index]?.assignee
                    ? `${defaultValues.sponsorTasks[index].assignee.firstName} ${defaultValues.sponsorTasks[index].assignee.lastName}`
                    : undefined
                }
              />
            </Box>
          ))}
          <Button
            startIcon={<AddCircle />}
            onClick={() =>
              append({
                dueDate: new Date(),
                notifyDate: undefined,
                assigneeUserId: undefined,
                notes: '',
                done: false
              })
            }
            sx={{ mt: 2 }}
          >
            Add Sponsor Task
          </Button>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default sponsorSchema;
