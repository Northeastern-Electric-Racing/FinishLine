import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Select,
  Typography,
  MenuItem,
  Checkbox,
  ListItemText
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
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>Vendor Name:*</FormLabel>
          <ReactHookTextField name="name" placeholder="Vendor Name Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>Username:*</FormLabel>
          <ReactHookTextField name="username" placeholder="Add Username Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.username?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>Password:*</FormLabel>
          <ReactHookTextField name="password" placeholder="Add Password Here" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.password?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>Discount:*</FormLabel>
          <ReactHookTextField name="discountCode" placeholder="Sponsor Value" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.discountCode?.message}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row" gap={2} sx={{ width: '100%' }}>
          <FormControl fullWidth>
            <FormLabel sx={{ alignSelf: 'start', fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>
              Tax Exempt:*
            </FormLabel>
            <Controller
              control={control}
              name="taxExempt"
              defaultValue={undefined}
              render={({ field: { onChange, value } }) => (
                <Select
                  displayEmpty
                  value={value === undefined ? '' : value.toString()}
                  onChange={(event) => {
                    const val = event.target.value;
                    onChange(val === 'true' ? true : val === 'false' ? false : undefined);
                  }}
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <Typography sx={{ color: 'gray' }}>Yes/No</Typography>;
                    }
                    return selected === 'true' ? 'Yes' : 'No';
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
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel sx={{ alignSelf: 'start', fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>
              2FA Contacts:
            </FormLabel>
            <Controller
              control={control}
              defaultValue={[]}
              name="twoFactorContacts"
              render={({ field: { onChange, value } }) => (
                <Select
                  multiple
                  displayEmpty
                  value={value !== undefined ? value : []}
                  onChange={onChange}
                  renderValue={(selected) => {
                    if (!Array.isArray(selected) || selected.length === 0) {
                      return <Typography sx={{ color: 'gray' }}>Select Member(s)</Typography>;
                    }
                    const selectedUsers = users.filter((u) => selected.includes(u.userId));
                    return selectedUsers.map((u) => `${u.firstName} ${u.lastName}`).join(', ');
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
                      <Checkbox checked={value?.includes(user.userId)} />
                      <ListItemText primary={`${user.firstName} ${user.lastName}`} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Box>
        <FormControl>
          <FormLabel sx={{ fontWeight: 'bold', fontSize: 18, textDecoration: 'underline' }}>Notes on Vendor:</FormLabel>
          <ReactHookTextField name="notes" placeholder="Sponsor is tax-exempt" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.note?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default VendorFormModal;
