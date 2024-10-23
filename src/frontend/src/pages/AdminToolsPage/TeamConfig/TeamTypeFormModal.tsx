import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Tooltip, Typography, Link } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import HelpIcon from '@mui/icons-material/Help';
import { TeamType } from 'shared';
import { CreateTeamTypePayload } from '../../../hooks/team-types.hooks';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';
import { useEffect } from 'react';

interface TeamTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: TeamType;
  onSubmit: (data: CreateTeamTypePayload) => Promise<TeamType>;
}

const schema = yup.object().shape({
  name: yup.string().required('Material Type is Required'),
  iconName: yup.string().required('Icon Name is Required'),
  description: yup.string().required('Description is Required')
});

const TeamTypeFormModal: React.FC<TeamTypeFormModalProps> = ({ open, handleClose, defaultValues, onSubmit }) => {
  const onFormSubmit = async (data: CreateTeamTypePayload) => {
    await onSubmit(data);
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
      name: defaultValues?.name ?? '',
      iconName: defaultValues?.iconName ?? '',
      description: defaultValues?.description ?? ''
    }
  });

  const formStorageKey = defaultValues ? FormStorageKey.EDIT_TEAM_TYPE : FormStorageKey.CREATE_TEAM_TYPE;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      iconName: defaultValues?.iconName ?? '',
      description: defaultValues?.description ?? ''
    });
  }, [defaultValues, reset]);

  const TooltipMessage = () => (
    <Typography sx={{ fontSize: 14 }}>
      Click to view possible icon names. For names with multiple words, seperate them with an _. AttachMoney = attach_money
    </Typography>
  );

  const handleCancel = () => {
    reset({ name: '', iconName: '', description: '' });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title="New Team Type"
      reset={() => reset({ name: '', iconName: '', description: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="team-type-form"
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
            <Link
              href="https://mui.com/components/material-icons/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <HelpIcon style={{ marginBottom: '-0.2em', fontSize: 'medium', marginLeft: '5px', color: 'lightgray' }} />
            </Link>
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

export default TeamTypeFormModal;
