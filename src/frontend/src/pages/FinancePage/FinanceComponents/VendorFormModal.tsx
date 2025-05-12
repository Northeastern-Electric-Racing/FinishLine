import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  MenuItem,
  Checkbox,
  ListItemText,
  Autocomplete,
  TextField
} from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Vendor } from 'shared';
import { EditVendorPayload } from '../../../hooks/finance.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { grey } from '@mui/material/colors';

interface VenderFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: Vendor;
  onSubmit: (data: EditVendorPayload) => void;
}

const VendorFormModal = ({ showModal, handleClose, defaultValues, onSubmit }: VenderFormModalProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    name: yup.string().required('Vendor Name is Required'),
    username: yup.string().required('Username is Required'),
    password: yup.string().required('Password is Required'),
    discountCode: yup.string().required('Discount is Required'),
    taxExempt: yup.boolean().required('Tax Exemption Status is Required'),
    twoFactorContacts: yup.array(),
    note: yup.string().optional()
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      username: defaultValues?.username ?? '',
      password: defaultValues?.password ?? '',
      discountCode: defaultValues?.discountCode ?? '',
      taxExempt: defaultValues?.taxExempt,
      twoFactorContacts: defaultValues?.twoFactorContacts.map((user) => user.userId) ?? [],
      note: defaultValues?.notes ?? ''
    }
  });

  const onFormSubmit = async (data: EditVendorPayload) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();

  if (!users || usersIsLoading) {
    return <LoadingIndicator />;
  }
  if (usersIsError) {
    return <ErrorPage message={usersError.message} />;
  }

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Vendor' : 'Add Vendor'}
      reset={() => reset({ name: '', username: '', password: '', discountCode: '', twoFactorContacts: [], note: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-vendor-form' : 'create-vendor-form'}
      showCloseButton
    >
      <Box display="flex" flexDirection={'column'} minWidth={400} maxWidth={400}>
        <FormControl sx={{ paddingBottom: 2 }}>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18 }}>Vendor Name:*</FormLabel>
          <ReactHookTextField name="name" placeholder="Vendor Name Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl sx={{ paddingBottom: 2 }}>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18 }}>Username:*</FormLabel>
          <ReactHookTextField name="username" placeholder="Add Username Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.username?.message}</FormHelperText>
        </FormControl>
        <FormControl sx={{ paddingBottom: 2 }}>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18 }}>Password:*</FormLabel>
          <ReactHookTextField name="password" placeholder="Add Password Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.password?.message}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row" gap={3} sx={{ width: '100%' }}>
          <FormControl sx={{ paddingBottom: 2, flex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 85 }}>
              <FormLabel
                sx={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: grey[400],
                  '&.Mui-focused': { color: grey[400] },
                  '&.Mui-error': { color: grey[400] }
                }}
              >
                Tax Exempt:*
              </FormLabel>
              <Controller
                control={control}
                name="taxExempt"
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value === true}
                    onChange={(event) => onChange(event.target.checked)}
                    sx={{ padding: 1, scale: 1.25 }}
                  />
                )}
              />
            </Box>
          </FormControl>
          <FormControl sx={{ paddingBottom: 2, flex: 3 }}>
            <FormLabel sx={{ fontWeight: 'bold', fontSize: 18 }}>Discount Code:*</FormLabel>
            <ReactHookTextField
              name="discountCode"
              placeholder="Add Discount Code Here"
              control={control}
              sx={{ width: 1 }}
            />
            <FormHelperText error>{errors.discountCode?.message}</FormHelperText>
          </FormControl>
        </Box>
        <FormControl fullWidth sx={{ paddingBottom: 2 }}>
          <FormLabel
            sx={{
              alignSelf: 'start',
              fontWeight: 'bold',
              fontSize: 18
            }}
          >
            2FA Contacts:
          </FormLabel>
          <Controller
            control={control}
            defaultValue={[]}
            name="twoFactorContacts"
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                options={users}
                disableCloseOnSelect
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                isOptionEqualToValue={(option, val) => option.userId === val.userId}
                value={users.filter((u) => value?.includes(u.userId)) || []}
                onChange={(_, newValue) => {
                  onChange(newValue.map((item) => item.userId));
                }}
                renderOption={(props, option, { selected }) => (
                  <MenuItem {...props} key={option.userId} dense sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox checked={selected} />
                    <ListItemText primary={`${option.firstName} ${option.lastName}`} />
                  </MenuItem>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={value?.length ? '' : 'Select Member(s)'}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 'auto',
                        flexWrap: 'wrap',
                        overflowY: 'auto'
                      }
                    }}
                  />
                )}
                popupIcon={null}
                clearIcon={null}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18 }}>Notes on Vendor:</FormLabel>
          <ReactHookTextField name="notes" placeholder="e.g. Vendor is tax-exempt" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.note?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default VendorFormModal;
