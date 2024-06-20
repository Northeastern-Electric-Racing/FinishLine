import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Box, Grid, Select, MenuItem } from '@mui/material';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, LinkCreateArgs, LinkType } from 'shared';
import { linkToLinkCreateArgs } from '../../../../utils/link.utils';

interface UsefulLinkFormModalProps {
  open: boolean;
  handleClose: () => void;
  clickedLink?: Link;
  onSubmit: (data: LinkCreateArgs[]) => void;
  linkTypes: LinkType[];
  currentLinks: Link[];
}

const UsefulLinkFormModal = ({
  open,
  handleClose,
  clickedLink,
  onSubmit,
  linkTypes,
  currentLinks
}: UsefulLinkFormModalProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    linkTypeName: yup.string().required('LinkType is Required'),
    url: yup.string().required('URL is required').url('URL is not valid')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      linkTypeName: clickedLink?.linkType.name ?? '',
      url: clickedLink?.url ?? ''
    }
  });

  const onFormSubmit = async (data: LinkCreateArgs) => {
    try {
      const previousLinks = linkToLinkCreateArgs(currentLinks);
      const newLinks = clickedLink
        ? [...previousLinks.filter((link) => link.linkId !== clickedLink.linkId), data]
        : [...previousLinks, data];
      console.log(newLinks);
      onSubmit(newLinks);
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
      title={!!clickedLink ? 'Edit Useful Link' : 'Create Useful Link'}
      reset={() => reset({ linkTypeName: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!clickedLink ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>LinkType</FormLabel>
            <Controller
              name="linkTypeName"
              control={control}
              render={({ field }) => (
                <Select {...field} error={!!errors.linkTypeName}>
                  {linkTypes.map((linkType) => (
                    <MenuItem value={linkType.name}>{linkType.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText error>{errors.linkTypeName?.message}</FormHelperText>
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
