/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  FormControl,
  FormHelperText,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  Autocomplete,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ProspectiveSponsor } from 'shared';
import NERModal from '../../../components/NERModal';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAcceptProspectiveSponsor, useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';

interface AcceptProspectiveSponsorModalProps {
  handleClose: () => void;
  prospectiveSponsor: ProspectiveSponsor;
  showModal: boolean;
}

interface AcceptFormInputs {
  sponsorTierId: string;
  sponsorValue: number;
  joinDate: Date;
  activeYears: number[];
  taxExempt: boolean;
  discountCode?: string;
  sponsorNotes?: string;
}

const getYears = (startYear = 1950) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
};

const acceptSchema = yup.object().shape({
  sponsorTierId: yup.string().required('Sponsor tier is required'),
  sponsorValue: yup.number().typeError('Must be a number').required('Sponsor value is required'),
  joinDate: yup.date().required('Join date is required'),
  activeYears: yup.array().of(yup.number().required()).min(1, 'At least one active year is required').required(),
  taxExempt: yup.boolean().required(),
  discountCode: yup.string().optional(),
  sponsorNotes: yup.string().optional()
});

const AcceptProspectiveSponsorModal = ({
  handleClose,
  prospectiveSponsor,
  showModal
}: AcceptProspectiveSponsorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useAcceptProspectiveSponsor();
  const {
    isLoading: tiersLoading,
    isError: tiersIsError,
    error: tiersError,
    data: sponsorTiers
  } = useGetAllSponsorTiers();
  const toast = useToast();

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const yearsOptions = getYears();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<AcceptFormInputs>({
    resolver: yupResolver(acceptSchema),
    defaultValues: {
      sponsorTierId: '',
      sponsorValue: 0,
      joinDate: new Date(),
      activeYears: [new Date().getFullYear()],
      taxExempt: false,
      discountCode: '',
      sponsorNotes: ''
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (tiersIsError) return <ErrorPage message={tiersError?.message} />;
  if (isLoading || tiersLoading || !sponsorTiers) return <LoadingIndicator />;

  const onSubmit = async (formData: AcceptFormInputs) => {
    try {
      await mutateAsync({
        prospectiveSponsorId: prospectiveSponsor.prospectiveSponsorId,
        sponsorTierId: formData.sponsorTierId,
        sponsorValue: formData.sponsorValue,
        joinDate: formData.joinDate,
        activeYears: formData.activeYears,
        taxExempt: formData.taxExempt,
        discountCode: formData.discountCode || undefined,
        sponsorNotes: formData.sponsorNotes || undefined
      });
      toast.success(`${prospectiveSponsor.organizationName} has been added as a sponsor! View them in the Sponsors tab.`);
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <NERModal
      open={showModal}
      title={`Accept ${prospectiveSponsor.organizationName} as Sponsor`}
      onHide={handleClose}
      submitText="Accept"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Sponsor Tier:*
          </Typography>
          <Controller
            control={control}
            name="sponsorTierId"
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value}
                onChange={onChange}
                size="small"
                renderValue={(selected) => {
                  const tier = sponsorTiers.find((t) => t.sponsorTierId === selected);
                  return tier ? tier.name : <Typography sx={{ color: 'gray' }}>Select Tier</Typography>;
                }}
              >
                {sponsorTiers.map((tier) => (
                  <MenuItem key={tier.sponsorTierId} value={tier.sponsorTierId}>
                    {tier.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.sponsorTierId?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Sponsor Value:*
          </Typography>
          <ReactHookTextField
            name="sponsorValue"
            type="number"
            control={control}
            size="small"
            placeholder="Enter Value"
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.sponsorValue}
          />
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Join Date:*
          </Typography>
          <Controller
            name="joinDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ? new Date(value) : null}
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onOpen={() => setDatePickerOpen(true)}
                onChange={(newValue) => onChange(newValue ?? new Date())}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!errors.joinDate,
                    helperText: errors.joinDate?.message,
                    onClick: () => setDatePickerOpen(true)
                  }
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Active Years:*
          </Typography>
          <Controller
            name="activeYears"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                options={yearsOptions}
                getOptionLabel={(option) => option.toString()}
                onChange={(_, data) => field.onChange(data)}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Years" error={!!errors.activeYears} />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                disableCloseOnSelect
              />
            )}
          />
          <FormHelperText error>{errors.activeYears?.message}</FormHelperText>
        </FormControl>

        <FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Controller
              control={control}
              name="taxExempt"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  sx={{ p: 0 }}
                />
              )}
            />
            <Typography variant="subtitle2" color="#EF4345">
              Tax Exempt
            </Typography>
          </Box>
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Discount Code:
          </Typography>
          <ReactHookTextField
            name="discountCode"
            control={control}
            size="small"
            placeholder="Enter Code"
          />
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" color="#EF4345">
            Notes:
          </Typography>
          <ReactHookTextField
            name="sponsorNotes"
            control={control}
            size="small"
            placeholder="Enter Notes"
            multiline
            rows={2}
          />
        </FormControl>
      </Box>
    </NERModal>
  );
};

export default AcceptProspectiveSponsorModal;
