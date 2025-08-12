import { FormControl, FormHelperText, FormLabel, Box } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SponsorTier } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { SponsorTierPayload } from '../../../hooks/finance.hooks';
import { AttachMoney } from '@mui/icons-material';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  threshold: yup
    .number()
    .min(0, 'Threshold must be at least 0')
    .typeError('Threshold must be a number')
    .required('Threshold is required'),
  colorHexCode: yup.string().default('#FF0000')
});

interface SponsorTierModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: SponsorTier;
  mutateAsync: (data: SponsorTierPayload) => Promise<SponsorTier>;
}

const SponsorTierModal: React.FC<SponsorTierModalProps> = ({ showModal, handleClose, defaultValues, mutateAsync }) => {
  const toast = useToast();

  const onSubmit = async (data: SponsorTierPayload) => {
    try {
      await mutateAsync(data);
      toast.success(`Sponsor Tier: ${data.name} ${defaultValues ? 'edited' : 'created'} successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      threshold: defaultValues?.threshold ?? 0,
      colorHexCode: defaultValues?.colorHexCode ?? '#FF0000'
    }
  });

  const colorValue = watch('colorHexCode');

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={`${defaultValues ? 'Edit' : 'Create'} Sponsor Tier`}
      reset={() => reset({ name: '', colorHexCode: '#FF0000' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-part-tag-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Tier Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
        <FormLabel>Support Threshold</FormLabel>
        <ReactHookTextField
          startAdornment={<AttachMoney />}
          name="threshold"
          control={control}
          type="number"
          sx={{ width: 1 }}
        />
        <FormHelperText error>{errors.threshold?.message}</FormHelperText>
        <FormLabel>Color</FormLabel>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ReactHookTextField name="colorHexCode" control={control} sx={{ width: 1 }} placeholder="#FF0000" />
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '1px solid #ccc',
              borderRadius: 1,
              backgroundColor: colorValue || '#FF0000'
            }}
          />
        </Box>
        <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default SponsorTierModal;
