import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch, Stack, Box, Typography, Tooltip, Link } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinkType } from 'shared';
import { LinkTypeCreatePayload } from '../../../utils/types';
import Icon from '@mui/material/Icon';
import HelpIcon from '@mui/icons-material/Help';

interface LinkTypeFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: LinkType;
  onSubmit: (data: LinkTypeCreatePayload) => void;
  linkTypes: LinkType[];
}

const LinkTypeFormModal = ({ showModal, handleClose, defaultValues, onSubmit, linkTypes }: LinkTypeFormModalProps) => {
  const toast = useToast();

  const uniqueLinkTypeTest = (name?: string) => !!name && linkTypes && !linkTypes.map((v) => v.name).includes(name);

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
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      iconName: defaultValues?.iconName ?? '',
      required: defaultValues?.required ?? false
    }
  });

  const iconNameWatch = watch('iconName');

  const onFormSubmit = async (data: LinkTypeCreatePayload) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };
  const tooltipMessage = (
    <Typography sx={{ fontSize: 14 }}>
      Click to view possible icon names. For names with multiple words, seperate them with an _. AttachMoney = attach_money
    </Typography>
  );
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
          <FormLabel>
            Icon Name
            <Tooltip title={tooltipMessage} placement="right" arrow sx={{ fontSize: 20 }}>
              <Link href="https://mui.com/components/material-icons/" target="_blank" rel="noopener noreferrer">
                <HelpIcon sx={{ mr: 2, height: 15 }} />
              </Link>
            </Tooltip>
          </FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReactHookTextField name="iconName" control={control} sx={{ flexGrow: 1 }} />
          </Box>
          <FormHelperText error>{errors.iconName?.message}</FormHelperText>
        </FormControl>
        {iconNameWatch && (
          <FormControl>
            <FormLabel>Icon Preview:</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Icon>{iconNameWatch}</Icon>
            </Box>
          </FormControl>
        )}
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
