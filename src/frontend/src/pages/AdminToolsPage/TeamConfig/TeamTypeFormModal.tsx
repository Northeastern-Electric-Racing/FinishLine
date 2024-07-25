import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Tooltip, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import HelpIcon from '@mui/icons-material/Help';
import { CreateTeamTypePayload, useCreateTeamType } from '../../../hooks/design-reviews.hooks';
import { TeamType } from 'shared';

interface TeamTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaulValues?: TeamType;
  onSubmit: (data: CreateTeamTypePayload) => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Material Type is Required'),
  iconName: yup.string().required('Icon Name is Required'),
  description: yup.string().required('Description is Required')
});

const CreateTeamTypeModal: React.FC<TeamTypeFormModalProps> = ({ open, handleClose, defaulValues, onSubmit }) => {
  const toast = useToast();

  const onFormSubmit = async (data: CreateTeamTypePayload) => {
    try {
      await onSubmit(data);
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
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaulValues?.name ?? '',
      iconName: defaulValues?.iconName ?? '',
      description: defaulValues?.description ?? ''
    }
  });

  const TooltipMessage = () => (
    <Typography sx={{ fontSize: 14 }}>
      Click to view possible icon names. For names with multiple words, seperate them with an _. AttachMoney = attach_money
    </Typography>
  );

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title="New Team Type"
      reset={() => reset({ name: '', iconName: '', description: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="new-team-type-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Team Type</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Icon Name</FormLabel>
          <Tooltip title={<TooltipMessage />} placement="right">
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
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Description</FormLabel>
        </Box>
        <ReactHookTextField name="description" control={control} />
        <FormHelperText error>{errors.description?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreateTeamTypeModal;
