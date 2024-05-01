/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Grid, FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { SecureSettingsFormInput } from './UserSecureSettings';

interface UserSecureSettingsEditProps {
  currentSettings: SecureSettingsFormInput;
  onSubmit: (data: SecureSettingsFormInput) => Promise<void>;
}

const schema = yup.object().shape({
  street: yup.string().required('Street is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipcode: yup
    .string()
    .required('Zipcode is required')
    .matches(/^\d{5}$/, 'Zipcode must be 5 digits'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  nuid: yup
    .string()
    .required('NUID is required')
    .matches(/^\d{9}$/, 'NUID must be 9 digits')
});

const UserSecureSettingsEdit: React.FC<UserSecureSettingsEditProps> = ({ currentSettings, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SecureSettingsFormInput>({
    defaultValues: currentSettings,
    resolver: yupResolver(schema)
  });

  return (
    <form id={'update-user-secure-settings'} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <FormLabel>Address</FormLabel>
            <ReactHookTextField name="street" control={control} rules={{ required: true }} errorMessage={errors.street} />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>City</FormLabel>
            <ReactHookTextField name="city" control={control} rules={{ required: true }} errorMessage={errors.city} />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>State</FormLabel>
            <ReactHookTextField name="state" control={control} rules={{ required: true }} errorMessage={errors.state} />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Zipcode</FormLabel>
            <ReactHookTextField name="zipcode" control={control} rules={{ required: true }} errorMessage={errors.zipcode} />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Phone Number</FormLabel>
            <ReactHookTextField
              name="phoneNumber"
              control={control}
              rules={{ required: true }}
              errorMessage={errors.phoneNumber}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>NUID</FormLabel>
            <ReactHookTextField name="nuid" control={control} rules={{ required: true }} errorMessage={errors.nuid} />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserSecureSettingsEdit;
