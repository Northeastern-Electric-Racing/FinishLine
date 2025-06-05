import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import {
  FormControl,
  FormHelperText,
  Box,
  MenuItem,
  Checkbox,
  ListItemText,
  Autocomplete,
  TextField,
  Typography
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
          <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#EF4345' }} variant="h5">
            Vendor Name:*
          </Typography>
          <ReactHookTextField name="name" placeholder="Vendor Name Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl sx={{ paddingBottom: 2 }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#EF4345' }} variant="h5">
            Username:*
          </Typography>
          <ReactHookTextField name="username" placeholder="Add Username Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.username?.message}</FormHelperText>
        </FormControl>
        <FormControl sx={{ paddingBottom: 2 }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#EF4345' }} variant="h5">
            Password:*
          </Typography>
          <ReactHookTextField name="password" placeholder="Add Password Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.password?.message}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row" gap={3} sx={{ width: '100%' }}>
          <FormControl
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingBottom: 2,
              flex: 2,
              paddingTop: 1
            }}
          >
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: 22,
                color: '#EF4345',
                textAlign: 'center',
                '&.Mui-focused': { color: '#EF4345' },
                '&.Mui-error': { color: '#EF4345' },
                marginBottom: 1
              }}
              variant="h5"
            >
              Tax Exempt:
            </Typography>
            <Controller
              control={control}
              name="taxExempt"
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value === true}
                  onChange={(event) => onChange(event.target.checked)}
                  sx={{ padding: 0, transform: 'scale(1.4)' }}
                />
              )}
            />
          </FormControl>
          <FormControl sx={{ paddingBottom: 2, flex: 3 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#EF4345' }} variant="h5">
              Discount Code:*
            </Typography>
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
          <Typography
            sx={{
              alignSelf: 'start',
              fontWeight: 'bold',
              fontSize: 22,
              color: '#EF4345'
            }}
            variant="h5"
          >
            2FA Contacts:
          </Typography>
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
          <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#EF4345' }} variant="h5">
            Notes on Vendor:
          </Typography>
          <ReactHookTextField name="notes" placeholder="e.g. Vendor is tax-exempt" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.note?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default VendorFormModal;
