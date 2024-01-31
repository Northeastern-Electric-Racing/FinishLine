import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch, Stack } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinkType } from 'shared';
import { EditLinkTypePayload } from '../../../hooks/projects.hooks';

interface LinkTypeFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: LinkType;
  onSubmit: (data: EditLinkTypePayload) => void;
  linkTypes: LinkType[];
}

const LinkTypeFormModal = ({ showModal, handleClose, defaultValues, onSubmit, linkTypes }: LinkTypeFormModalProps) => {
  const toast = useToast();

  const uniqueLinkTypeTest = (name: string | undefined) =>
    name !== undefined && linkTypes !== undefined && !linkTypes.map((v) => v.name).includes(name);

  const schema = yup.object().shape({
    name: yup
      .string()
      .required('LinkType Name is Required')
      .test('unique-LinkType-test', 'LinkType name must be unique', uniqueLinkTypeTest),
    iconName: yup.string().required('Icon name is required'),
    required: yup.boolean().required('Required field must be specified')
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
      iconName: defaultValues?.iconName ?? '',
      required: defaultValues?.required ?? false
    }
  });

  const onFormSubmit = async (data: EditLinkTypePayload) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit LinkType' : 'Create LinkType'}
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-LinkType-form' : 'create-LinkType-form'}
      showCloseButton
    >
      <Stack spacing={2} sx={{ width: '100%' }}>
        <FormControl>
          <FormLabel>LinkType Name</FormLabel>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Icon Name</FormLabel>
          <ReactHookTextField name="iconName" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.iconName?.message}</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Required</FormLabel>
          <Controller
            name="required"
            control={control}
            render={({ field }) => <Switch {...field} checked={field.value} />}
          />
          <FormHelperText error>{errors.required?.message}</FormHelperText>
        </FormControl>
      </Stack>
    </NERFormModal>
  );
};

export default LinkTypeFormModal;
