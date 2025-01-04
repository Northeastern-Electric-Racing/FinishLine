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
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';

const schema = yup.object().shape({
  name: yup.string().required('Material Type is Required'),
  iconName: yup.string().required('Icon Name is Required')
});

interface CreateTeamTypeModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateTeamTypeModal: React.FC<CreateTeamTypeModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useCreateTeamType();

  const onSubmit = async (data: CreateTeamTypePayload) => {
    try {
      await mutateAsync(data);
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
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      iconName: ''
    }
  });

  useFormPersist(FormStorageKey.CREATE_TEAM_TYPE, {
    watch,
    setValue
  });

  if (isLoading) return <LoadingIndicator />;

  const TooltipMessage = () => (
    <Typography sx={{ fontSize: 14 }}>
      Click to view possible icon names. For names with multiple words, seperate them with an _. AttachMoney = attach_money
    </Typography>
  );

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Team Type"
      reset={() => reset({ name: '', iconName: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
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
    </NERFormModal>
  );
};

export default CreateTeamTypeModal;
