import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Box, Grid, Select, MenuItem } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinkCreateArgs, LinkType, LinkTypeCreatePayload } from 'shared';

interface UsefulLinkFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: LinkCreateArgs;
  onSubmit: (data: LinkCreateArgs[]) => void;
  linkTypes: LinkType[];
}

const UsefulLinkFormModal = ({ open, handleClose, defaultValues, onSubmit, linkTypes }: UsefulLinkFormModalProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    linkTypeName: yup.string().required('LinkType is Required'),
    url: yup.string().required('URL is required')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      linktypeName: defaultValues?.linkTypeName ?? '',
      url: defaultValues?.url ?? ''
    }
  });

  const onFormSubmit = async (data: LinkCreateArgs[]) => {
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
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Useful Link' : 'Create Useful Link'}
      reset={() => reset({ linktypeName: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>LinkType</FormLabel>
            <Select name="linkTypeName" defaultValue={defaultValues?.linkTypeName ?? ''} error={!!errors.linktypeName}>
              {linkTypes.map((linkType) => (
                <MenuItem value={linkType.name}>{linkType.name}</MenuItem>
              ))}
            </Select>{' '}
            <FormHelperText error>{errors.linktypeName?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
              <FormLabel>URL</FormLabel>
            </Box>
            <ReactHookTextField name="url" control={control} />
            <FormHelperText error>{errors.url?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth></FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default UsefulLinkFormModal;
