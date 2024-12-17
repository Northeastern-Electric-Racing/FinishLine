import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormLabel, Button, IconButton, TextField, FormHelperText, Box, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { useUpdateOrganizationContacts } from '../../../hooks/organizations.hooks'; // Assume hook exists
import { Contact, User } from 'shared';
import { useAllUsers } from '../../../hooks/users.hooks';

const schema = yup.object().shape({
  contacts: yup
    .array()
    .of(
      yup.object({
        userId: yup.string().required('User cannot be empty'),
        title: yup.string().required('Title cannot be empty')
      })
    )
    .min(1, 'At least one contact is required')
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

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();

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
    const updatedContacts = {
      userIds: data.contacts.map((c) => c.userId),
      titles: data.contacts.map((c) => c.title)
    };

    try {
      await mutateAsync(updatedContacts);
      toast.success('Contacts updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
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
                <Select {...field} label={`User ${index + 1}`} variant="outlined" fullWidth>
                  <MenuItem value="" disabled>
                    Select a User
                  </MenuItem>
                  {users.map((user: User) => (
                    <MenuItem value={user.userId}>{`${user.firstName} ${user.lastName}`}</MenuItem>
                  ))}
                </Select>
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
