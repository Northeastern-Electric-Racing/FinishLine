import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormLabel, Button, IconButton, TextField, FormHelperText, Box, Autocomplete } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { useUpdateOrganizationContacts } from '../../../hooks/organizations.hooks'; // Assume hook exists
import { Contact } from 'shared';
import { useAllMembers } from '../../../hooks/users.hooks';
import { fullNamePipe } from '../../../utils/pipes';

const schema = yup.object().shape({
  contacts: yup
    .array()
    .of(
      yup.object({
        userId: yup.string().required('User cannot be empty'),
        title: yup.string().required('Title cannot be empty')
      })
    )
    .required()
});

interface FormValues {
  contacts: { userId: string; title: string }[];
}

interface UpdateOnboardingContactsModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues: { contacts: Contact[] };
}

const UpdateOnboardingContactsModal: React.FC<UpdateOnboardingContactsModalProps> = ({
  showModal,
  handleClose,
  defaultValues
}) => {
  const toast = useToast();
  const {
    isLoading: updateContactsIsLoading,
    isError: updateContactsIsError,
    error: updateContactsError,
    mutateAsync
  } = useUpdateOrganizationContacts();

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllMembers();

  const contactsAsObjects = useMemo(
    () =>
      defaultValues.contacts.map((c) => ({
        userId: c.user.userId,
        title: c.title
      })),
    [defaultValues.contacts]
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { contacts: contactsAsObjects }
  });

  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: 'contacts'
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await mutateAsync({
        contacts: data.contacts
      });
      toast.success('Contacts updated successfully');
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      reset({ contacts: contactsAsObjects });
    }
  }, [showModal, defaultValues, reset, contactsAsObjects]);

  if (updateContactsIsError) return <ErrorPage message={updateContactsError?.message} />;
  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (updateContactsIsLoading || allUsersIsLoading || !users) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Update Contacts"
      reset={() => reset({ contacts: contactsAsObjects })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      disabled={!!errors.contacts}
      formId="edit-contacts-form"
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <FormLabel>Contacts</FormLabel>
        {fields.map((field, index) => (
          <Box key={field.id} display="flex" alignItems="center" gap={1}>
            <Controller
              name={`contacts.${index}.userId`}
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={users.map((user) => user.userId)}
                  getOptionLabel={(option: string) => (option ? fullNamePipe(users.find((u) => u.userId === option)) : '')}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label={`User ${index + 1}`} variant="outlined" fullWidth />
                  )}
                  sx={{ minWidth: '300px' }}
                />
              )}
            />
            <Controller
              name={`contacts.${index}.title`}
              control={control}
              render={({ field }) => (
                <TextField {...field} label={`Title ${index + 1}`} variant="outlined" fullWidth sx={{ minWidth: '300px' }} />
              )}
            />
            <IconButton onClick={() => remove(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={() => append({ userId: '', title: '' })}
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Contact
        </Button>
        <FormHelperText error>{errors.contacts?.message}</FormHelperText>
      </Box>
    </NERFormModal>
  );
};

export default UpdateOnboardingContactsModal;
