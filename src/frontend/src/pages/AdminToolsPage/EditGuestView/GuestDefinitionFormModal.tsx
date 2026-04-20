import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';
import { GuestDefinitionPayload } from '../../../hooks/recruitment.hooks';
import { GuestDefinition, GuestDefinitionType } from 'shared';

interface GuestDefinitionFormModalProps {
  open: boolean;
  handleClose: () => void;
  type: GuestDefinitionType;
  defaultValues?: GuestDefinition;
  onSubmit: (data: GuestDefinitionPayload) => Promise<GuestDefinition>;
}

const schema = yup.object().shape({
  term: yup.string().required('Term is required'),
  description: yup.string().required('Description is required'),
  order: yup.number().required('Order is required').min(0, 'Order must be non-negative'),
  icon: yup.string().optional(),
  buttonText: yup.string().optional(),
  buttonLink: yup.string().optional()
});

const GuestDefinitionFormModal: React.FC<GuestDefinitionFormModalProps> = ({
  open,
  handleClose,
  type,
  defaultValues,
  onSubmit
}) => {
  const onFormSubmit = async (data: Omit<GuestDefinitionPayload, 'type'>) => {
    await onSubmit({
      ...data,
      type,
      icon: data.icon || undefined,
      buttonText: data.buttonText || undefined,
      buttonLink: data.buttonLink || undefined
    });
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      term: defaultValues?.term ?? '',
      description: defaultValues?.description ?? '',
      order: defaultValues?.order ?? 0,
      icon: defaultValues?.icon ?? '',
      buttonText: defaultValues?.buttonText ?? '',
      buttonLink: defaultValues?.buttonLink ?? ''
    }
  });

  const formStorageKey = defaultValues ? FormStorageKey.EDIT_GUEST_DEFINITION : FormStorageKey.CREATE_GUEST_DEFINITION;

  useFormPersist(formStorageKey, { watch, setValue });

  const handleCancel = () => {
    reset({ term: '', description: '', order: 0, icon: '', buttonText: '', buttonLink: '' });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={`${defaultValues ? 'Edit' : 'New'} ${type === GuestDefinitionType.PROJECT_MANAGEMENT ? 'Project Management' : 'Info Page'} Definition`}
      reset={() => reset({ term: '', description: '', order: 0, icon: '', buttonText: '', buttonLink: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="guest-definition-form"
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Term*</FormLabel>
        <ReactHookTextField name="term" control={control} placeholder="Enter term" sx={{ width: 1 }} />
        <FormHelperText error>{errors.term?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Description*</FormLabel>
        <ReactHookTextField name="description" control={control} placeholder="Enter description" />
        <FormHelperText error>{errors.description?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Order*</FormLabel>
        <ReactHookTextField name="order" control={control} type="number" placeholder="Enter display order" />
        <FormHelperText error>{errors.order?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Icon</FormLabel>
        <ReactHookTextField name="icon" control={control} placeholder="Enter icon name (optional)" />
        <FormHelperText error>{errors.icon?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Button Text</FormLabel>
        <ReactHookTextField name="buttonText" control={control} placeholder="Enter button text (optional)" />
        <FormHelperText error>{errors.buttonText?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Button Link</FormLabel>
        <ReactHookTextField name="buttonLink" control={control} placeholder="Enter button link (optional)" />
        <FormHelperText error>{errors.buttonLink?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default GuestDefinitionFormModal;
