import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch, Box, Typography, Tooltip, Grid } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinkType } from 'shared';
import { LinkTypeCreatePayload } from '../../../utils/types';
import Icon from '@mui/material/Icon';
import HelpIcon from '@mui/icons-material/Help';
import { useTheme } from '@mui/material/styles';

interface LinkTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: LinkType;
  onSubmit: (data: LinkTypeCreatePayload) => void;
  linkTypes: LinkType[];
  creatingNew: boolean;
}

const LinkTypeFormModal = ({
  open,
  handleClose,
  defaultValues,
  onSubmit,
  linkTypes,
  creatingNew
}: LinkTypeFormModalProps) => {
  const toast = useToast();

  const uniqueLinkTypeTest = (name?: string) =>
    !creatingNew || (!!name && linkTypes && !linkTypes.map((v) => v.name).includes(name));

  const schema = yup.object().shape({
    name: yup
      .string()
      .required('LinkType Name is Required')
      .test('unique-LinkType-test', 'LinkType name must be unique', uniqueLinkTypeTest),
    iconName: yup.string().required('Icon name is required'),
    required: yup.boolean().required('Required field must be specified')
  });

  const theme = useTheme();

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

  const currentIconName = watch('iconName');

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
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit LinkType' : 'Create LinkType'}
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-LinkType-form' : 'create-LinkType-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>LinkType Name</FormLabel>
            {creatingNew ? (
              <ReactHookTextField name="name" control={control} />
            ) : (
              <ReactHookTextField name="name" control={control} readOnly />
            )}
            <FormHelperText error>{errors.name?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ '&.Mui-focused': { color: theme.palette.text.secondary } }}>Required</FormLabel>
            <Controller
              name="required"
              control={control}
              render={({ field }) => <Switch {...field} checked={field.value} />}
            />
            <FormHelperText error>{errors.required?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
              <FormLabel>Icon Name</FormLabel>
              <Tooltip title={tooltipMessage} placement="right">
                <a
                  href="https://mui.com/components/material-icons/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <HelpIcon style={{ marginBottom: '-0.2em', fontSize: 'medium', marginLeft: '5px', color: 'lightgray' }} />
                </a>
              </Tooltip>
            </Box>
            <ReactHookTextField name="iconName" control={control} />
            <FormHelperText error>{errors.iconName?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Icon Preview</FormLabel>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: 1,
                borderColor: 'rgb(118, 118, 118)',
                padding: '8px',
                borderRadius: '6px',
                marginTop: '1px',
                height: '56px',
                width: '96px'
              }}
            >
              {currentIconName && <Icon sx={{ color: 'white', fontSize: '2.75em' }}>{currentIconName}</Icon>}
            </Box>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default LinkTypeFormModal;
