import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormLabel, Button, IconButton, TextField, FormHelperText, Box } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { useUpdateOrganizationContacts } from '../../../hooks/organizations.hooks';

const schema = yup.object().shape({
  contacts: yup
    .array()
    .of(yup.object({ value: yup.string().required('Contact cannot be empty') }))
    .min(1, 'At least one contact is required')
});

interface Contact {
  value: string;
}

interface FormValues {
  contacts: Contact[];
}

interface UpdateOnboardingContactsModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues: { contacts: string[] };
}

const UpdateOnboardingContactsModal: React.FC<UpdateOnboardingContactsModalProps> = ({
  showModal,
  handleClose,
  defaultValues
}) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useUpdateOrganizationContacts();

  const contactsAsObjects = defaultValues.contacts.map((c) => ({ value: c }));

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
    const updatedContacts = data.contacts.map((c) => c.value);

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
      const contactsAsObjects = defaultValues.contacts.map((c) => ({ value: c }));
      reset({ contacts: contactsAsObjects });
    }
  }, [showModal, defaultValues, reset]);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

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
              name={`contacts.${index}.value`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`Contact ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  sx={{
                    minWidth: '500px'
                  }}
                  error={!!errors?.contacts?.[index]?.value?.message}
                  helperText={errors?.contacts?.[index]?.value?.message as string}
                />
              )}
            />
            <IconButton onClick={() => remove(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={() => append({ value: '' })}
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
