import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Box, Grid, Select, MenuItem } from '@mui/material';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, LinkCreateArgs, LinkType } from 'shared';
import { linkToLinkCreateArgs } from '../../../../utils/link.utils';
import { useEditLinkTypeByName } from '../../../../hooks/projects.hooks';

interface UsefulLinkFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaulValues?: Link;
  onSubmit: (data: LinkCreateArgs[]) => Promise<unknown>;
  linkTypes: LinkType[];
  currentLinks: Link[];
  isOnGuestHomePage: boolean;
  isOnNewMemberDashboard: boolean;
  isOnOnboardingDashboard: boolean;
}

const UsefulLinkFormModal = ({
  open,
  handleClose,
  defaulValues,
  onSubmit,
  linkTypes,
  currentLinks,
  isOnGuestHomePage,
  isOnNewMemberDashboard,
  isOnOnboardingDashboard
}: UsefulLinkFormModalProps) => {
  const toast = useToast();
  const { mutateAsync: editLinkTypeAsync } = useEditLinkTypeByName();

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
      linkTypeName: defaulValues?.linkType.name ?? '',
      url: defaulValues?.url ?? ''
    }
  });

  const onFormSubmit = async (data: LinkCreateArgs) => {
    try {
      const selectedLinkType = linkTypes.find((linkType) => linkType.name === data.linkTypeName);
      const needsDashboardFlag =
        selectedLinkType &&
        ((isOnGuestHomePage && !selectedLinkType.isOnGuestHomePage) ||
          (isOnNewMemberDashboard && !selectedLinkType.isOnNewMemberDashboard) ||
          (isOnOnboardingDashboard && !selectedLinkType.isOnOnboardingDashboard));

      if (selectedLinkType && needsDashboardFlag) {
        await editLinkTypeAsync({
          name: selectedLinkType.name,
          data: {
            name: selectedLinkType.name,
            iconName: selectedLinkType.iconName,
            required: selectedLinkType.required,
            isOnGuestHomePage: selectedLinkType.isOnGuestHomePage || isOnGuestHomePage,
            isOnNewMemberDashboard: selectedLinkType.isOnNewMemberDashboard || isOnNewMemberDashboard,
            isOnOnboardingDashboard: selectedLinkType.isOnOnboardingDashboard || isOnOnboardingDashboard
          }
        });
      }

      const previousLinks = linkToLinkCreateArgs(currentLinks);
      const newLinks = defaulValues
        ? [...previousLinks.filter((link) => link.linkId !== defaulValues.linkId), data]
        : [...previousLinks, data];
      await onSubmit(newLinks);
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaulValues ? 'Edit Useful Link' : 'Create Useful Link'}
      reset={() => reset({ linkTypeName: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaulValues ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Link Type</FormLabel>
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
